// Build with CJS: tsc -p tsconfig.json  (module: commonjs)
// Run: node dist/rag_query.js

import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

// Use CJS require for faiss-node (CommonJS package)
const requireCJS = createRequire(__filename);
const { IndexFlatIP } = requireCJS("faiss-node");

// Minimal local types to avoid ESM type-imports in CJS output
type FeatureExtractionPipeline = (
  x: string | string[],
  opts?: { pooling?: "mean" | "none"; normalize?: boolean }
) => Promise<any>;
type Tensor = { dims?: number[]; data: Float32Array };

// ---- Config ----
const ART = "rag_artifacts";
const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
const TOP_K = 5;

// Dynamically import ESM-only transformers at runtime (works in CJS)
async function loadTransformers(): Promise<{
  pipeline: (task: string, model: string) => Promise<FeatureExtractionPipeline>;
  env: any;
}> {
  const mod = (await import("@huggingface/transformers")) as any; // dynamic import OK in CJS
  mod.env.localModelPath = "./models/";
  mod.env.allowRemoteModels = true;
  return { pipeline: mod.pipeline, env: mod.env };
}

type Meta = { id: string; text: string; source: string; title: string }[];

async function loadArtifacts() {
  const indexPath = path.join(ART, "kb.index");
  const metaPath = path.join(ART, "metadata.json");
  const meta: Meta = JSON.parse(await fs.readFile(metaPath, "utf8"));
  const index = IndexFlatIP.read(indexPath); // instance
  return { index, meta };
}

// Embed like Python ST: [question] → mean pool, normalize=false, then manual L2
async function embed(question: string, extractor: FeatureExtractionPipeline): Promise<Float32Array> {
  const out = (await extractor([question], { pooling: "mean", normalize: false })) as Tensor | Tensor[];
  let vec: Float32Array;
  if (Array.isArray(out)) {
    vec = out[0].data as Float32Array;
  } else {
    const dims = out.dims ?? [1, (out.data as Float32Array).length];
    const d = dims[1] ?? (out.data as Float32Array).length;
    vec = (out.data as Float32Array).subarray(0, d);
  }
  // L2-normalize
  let s = 0;
  for (let i = 0; i < vec.length; i++) {
    s += vec[i] * vec[i];
  }
  const inv = 1 / (Math.sqrt(s) + 1e-12);
  const normed = new Float32Array(vec.length);
  for (let i = 0; i < vec.length; i++) {
    normed[i] = vec[i] * inv;
  }
  return normed;
}

function retrieve(
  _question: string,
  index: InstanceType<typeof IndexFlatIP>,
  meta: Meta,
  qvec: Float32Array,
  k = TOP_K
) {
  const dim = index.getDimension();
  const nTotal = index.ntotal();
  if (dim !== qvec.length) {
    throw new Error(`FAISS dim mismatch: ${dim} != ${qvec.length}`);
  }
  if (nTotal !== meta.length) {
    throw new Error(`FAISS ntotal != meta.length: ${nTotal} != ${meta.length}`);
  }

  const { distances, labels } = index.search(Array.from(qvec), Math.min(k, meta.length));
  const hits = labels
    .map((lbl: number, i: number) => ({ lbl, score: distances[i] }))
    .filter((x: { lbl: number; }) => x.lbl >= 0 && x.lbl < meta.length)
    .map((h: { score: any; lbl:any; }) => [h.score, meta[h.lbl]] as const);
  return hits;
}

function formatContext(hits: ReadonlyArray<readonly [number, Meta[number]]>) {
  const blocks = hits.map(([score, rec]) => `[source: ${rec.source} | score: ${score.toFixed(3)}]\n${rec.text}`);
  return blocks.join("\n\n---\n\n");
}

async function writeResult(prompt: string, response?: string) {
  await fs.mkdir(ART, { recursive: true });
  const file = path.join(ART, "result.txt");
  const header = "------ PROMPT ------\n";
  const body = `${prompt}\n\n`;
  const respHeader = "------ OLLAMA RESPONSE ------\n";
  const respBody = response ? `${response}\n` : "";
  await fs.writeFile(file, header + body + (response ? respHeader + respBody : ""), "utf8");
  console.log("Saved:", file);
}

export async function getRagContext() {
  const { pipeline } = await loadTransformers(); // dynamic ESM import
  const extractor = (await pipeline("feature-extraction", MODEL_ID)) as FeatureExtractionPipeline;

  const { index, meta } = await loadArtifacts();
  const question = "what is Var";
  const qvec = await embed(question, extractor);
  const hits = retrieve(question, index, meta, qvec, TOP_K);
  const ctx = formatContext(hits);
  
  return ctx;
}
