"""
Prepare a retrieval corpus from Markdown files:
- Split by headings + chunk long sections with overlap
- Embed with SentenceTransformers
- Build a FAISS inner-product (cosine) index
- Persist chunks (JSONL), FAISS index, and metadata

Edit the CONFIG section below to change folders, model, and chunk sizes.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


# ------------------------------- CONFIG ------------------------------------ #

FOLDERS: List[str] = [
    "rag-knowledge-base/websharper",
]

OUT_DIR: Path = Path("rag-artifacts")
MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

CHUNK_MAX_CHARS: int = 1800     # ~300–500 tokens depending on density
CHUNK_OVERLAP_CHARS: int = 200  # ~10–15% overlap

LOG_LEVEL: str = "INFO"         # "DEBUG" | "INFO" | "WARNING" | "ERROR"


# ------------------------------ Data model --------------------------------- #

@dataclass(frozen=True)
class ChunkRecord:
    """A single retrievable unit."""
    id: str
    text: str
    source: str   # original file path
    title: str    # derived from file stem


# ------------------------------ Utilities ---------------------------------- #

_HEADING_SPLIT = re.compile(r"(?m)(^#{1,6}\s.*$)")
_NEWLINES_3PLUS = re.compile(r"\n{3,}")


def read_markdown(path: Path) -> str:
    """Read Markdown as UTF-8 (ignoring errors) and normalize blank lines."""
    text = path.read_text(encoding="utf-8", errors="ignore")
    return _NEWLINES_3PLUS.sub("\n\n", text).strip()


def split_by_headings(markdown: str) -> List[str]:
    """
    Split on Markdown headings, keeping the heading with its section body.
    Returns a list of sections.
    """
    parts = _HEADING_SPLIT.split(markdown)
    if not parts:
        return [markdown]

    sections: List[str] = []

    # Preface before the first heading
    if not parts[0].startswith("#"):
        preface = parts[0].strip()
        if preface:
            sections.append(preface)
        parts = parts[1:]

    for i in range(0, len(parts), 2):
        head = parts[i].strip()
        body = parts[i + 1].strip() if i + 1 < len(parts) else ""
        section = f"{head}\n{body}".strip()
        if section:
            sections.append(section)

    return sections


def chunk_long_text(text: str, *, max_chars: int, overlap: int) -> List[str]:
    """
    Greedy chunking with character overlap. Tries to end at a paragraph break
    (blank line) when it doesn't cut too much.
    """
    chunks: List[str] = []
    start = 0
    n = len(text)

    while start < n:
        end = min(n, start + max_chars)
        window = text[start:end]

        # Backtrack to a paragraph boundary if it's at least ~60% into the window
        back = window.rfind("\n\n")
        if back > int(max_chars * 0.6):
            end = start + back

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Advance with overlap; guard against negative movement at EOF
        start = max(end - overlap, end)

    return chunks


def chunk_markdown(md_text: str, *, max_chars: int, overlap: int) -> List[str]:
    """Split Markdown into sections, then chunk long sections."""
    chunks: List[str] = []
    for section in split_by_headings(md_text):
        if len(section) <= max_chars:
            chunks.append(section)
        else:
            chunks.extend(chunk_long_text(section, max_chars=max_chars, overlap=overlap))
    return chunks


def iter_markdown_files(folders: Iterable[str]) -> Iterable[Path]:
    """Recursively yield all *.md files under the given folders."""
    for folder in folders:
        base = Path(folder)
        if not base.exists():
            logging.warning("Folder not found: %s", base)
            continue
        yield from base.rglob("*.md")


# ------------------------------ Embeddings --------------------------------- #

def embed_texts(model_name: str, texts: List[str]) -> np.ndarray:
    """
    Embed texts with SentenceTransformers and L2-normalize for cosine similarity.
    Returns float32 array of shape (n, dim).
    """
    if not texts:
        return np.zeros((0, 0), dtype="float32")

    model = SentenceTransformer(model_name)
    embs = model.encode(
        texts,
        convert_to_numpy=True,
        batch_size=64,
        show_progress_bar=True,
    )
    norms = np.linalg.norm(embs, axis=1, keepdims=True) + 1e-12
    return (embs / norms).astype("float32")


def build_faiss_ip_index(embs: np.ndarray) -> faiss.Index:
    """Build a FAISS inner-product index from normalized embeddings."""
    if embs.size == 0:
        raise ValueError("No embeddings to index.")
    dim = embs.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embs)
    return index


# --------------------------------- IO -------------------------------------- #

def save_jsonl(records: List[ChunkRecord], path: Path) -> None:
    """Write one JSON object per line for easy inspection."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        for record in records:
            file.write(json.dumps(asdict(record), ensure_ascii=False) + "\n")


def save_metadata(records: List[ChunkRecord], path: Path) -> None:
    """Save all records as a pretty JSON list."""
    path.parent.mkdir(parents=True, exist_ok=True)
    data = [asdict(record) for record in records]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# --------------------------------- Main ------------------------------------ #

def prepare_corpus(
    folders: Iterable[str],
    out_dir: Path,
    model_name: str,
    chunk_max_chars: int,
    chunk_overlap_chars: int,
) -> None:
    """
    End-to-end pipeline:
      - read & chunk markdown
      - embed & index
      - persist artifacts
    """
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1) Read & chunk
    records: List[ChunkRecord] = []
    for path in iter_markdown_files(folders):
        raw = read_markdown(path)
        chunks = chunk_markdown(
            raw,
            max_chars=chunk_max_chars,
            overlap=chunk_overlap_chars,
        )
        for i, chunk in enumerate(chunks):
            records.append(
                ChunkRecord(
                    id=f"{path}::chunk-{i}",
                    text=chunk,
                    source=str(path),
                    title=path.stem.replace("-", " "),
                )
            )

    logging.info(
        "Prepared %d chunks from %d files.",
        len(records),
        len({r.source for r in records}),
    )

    if not records:
        logging.warning("No Markdown files found. Nothing to do.")
        return

    # 2) Persist chunks for inspection
    chunks_path = out_dir / "chunks.jsonl"
    save_jsonl(records, chunks_path)
    logging.info("Wrote chunks: %s", chunks_path)

    # 3) Embed
    texts = [r.text for r in records]
    embs = embed_texts(model_name, texts)
    logging.info("Embeddings: shape=%s dtype=%s", embs.shape, embs.dtype)

    # 4) Build index
    index = build_faiss_ip_index(embs)

    # 5) Persist index + metadata
    index_path = out_dir / "kb.index"
    faiss.write_index(index, str(index_path))
    save_metadata(records, out_dir / "metadata.json")

    logging.info("Wrote FAISS index: %s", index_path)
    logging.info("Wrote metadata: %s", out_dir / "metadata.json")

    print(f"Saved {len(records)} chunks → {chunks_path}")
    print(f"Wrote index → {index_path}")
    print(f"Wrote metadata → {out_dir/'metadata.json'}")


def main() -> None:
    logging.basicConfig(level=getattr(logging, LOG_LEVEL), format="%(levelname)s: %(message)s")
    prepare_corpus(
        folders=FOLDERS,
        out_dir=OUT_DIR,
        model_name=MODEL_NAME,
        chunk_max_chars=CHUNK_MAX_CHARS,
        chunk_overlap_chars=CHUNK_OVERLAP_CHARS,
    )


if __name__ == "__main__":
    main()
