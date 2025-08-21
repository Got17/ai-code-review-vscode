# RAG Prepare

This script prepares a **retrieval corpus** from Markdown files for use in a Retrieval-Augmented Generation (RAG) workflow.

It reads Markdown files, chunks them into manageable pieces, embeds each chunk with a SentenceTransformers model, and builds a searchable **FAISS vector index**. The output is stored under `rag-artifacts/` and can be queried later with a retrieval script.

## Features

* **Markdown ingestion**
  Recursively scans folders for `*.md` files.

* **Text preprocessing**

  * Normalizes excessive newlines.
  * Splits by Markdown headings (`# H1`, `## H2`, …).
  * Breaks long sections into overlapping chunks (default 1800 chars, 200-char overlap).

* **Embeddings**

  * Uses [SentenceTransformers](https://www.sbert.net/) (`all-MiniLM-L6-v2` by default).
  * L2-normalizes embeddings so **dot product = cosine similarity**.

* **Vector index**

  * Stores embeddings in a **FAISS inner-product index**.
  * Enables fast similarity search.

* **Artifacts** (all written under `rag-artifacts/` by default):

  * `chunks.jsonl` → one chunk per line (easy inspection).
  * `metadata.json` → metadata for all chunks (list of dicts).
  * `kb.index` → FAISS index file.

## Configuration

At the top of `rag-prepare.py`, you can tweak:

```python
FOLDERS = [
    "rag-knowledge-base/fsharp",
    "rag-knowledge-base/websharper",
]

OUT_DIR = Path("rag-artifacts")
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

CHUNK_MAX_CHARS = 1800
CHUNK_OVERLAP_CHARS = 200
```

* `FOLDERS` → where your Markdown files live
* `OUT_DIR` → output directory for artifacts
* `MODEL_NAME` → embedding model to use
* `CHUNK_MAX_CHARS` / `CHUNK_OVERLAP_CHARS` → chunking strategy

## Installation

Install dependencies from the provided requirements file (CPU-safe defaults):

```bash
pip install -r requirements.txt
```

If you have a CUDA-enabled GPU and want GPU acceleration, install FAISS with:

```bash
pip install faiss-gpu
```

*(In that case, you may want to replace `faiss-cpu` with `faiss-gpu` in `requirements.txt` to avoid conflicts.)*

## Usage

Run the script directly:

```bash
python rag-prepare.py
```

You should see logs like:

```
INFO: Prepared 123 chunks from 5 files.
INFO: Wrote chunks: rag-artifacts/chunks.jsonl
INFO: Embeddings: shape=(123, 384) dtype=float32
INFO: Wrote FAISS index: rag-artifacts/kb.index
INFO: Wrote metadata: rag-artifacts/metadata.json
```

## Output

After running, you’ll have:

```
rag-artifacts/
├── chunks.jsonl     # raw chunks, one per line
├── kb.index         # FAISS vector index
└── metadata.json    # metadata list (id, text, source, title)
```

## What you can do with it

* Use `kb.index` + `metadata.json` to build a **retrieval layer**.
* Query with a user question, get the most relevant chunks.
* Feed retrieved context into your LLM (e.g. with Ollama, LangChain, or a custom pipeline).

This is the **“prepare” step** of RAG: transforming raw Markdown knowledge into a structured, searchable vector database.