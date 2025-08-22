import * as vscode from 'vscode';
import { createRequire } from 'node:module';

const requireCJS = createRequire(__filename);
const { IndexFlatIP } = requireCJS('faiss-node');

type MetaRec = { id: string; text: string; source: string; title: string };
type Meta = MetaRec[];
type FeatureExtractionPipeline = (x: string | string[], opts?: { pooling?: 'mean' | 'none'; normalize?: boolean }) => Promise<any>;
type Tensor = { dims?: number[]; data: Float32Array };

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

async function loadTransformers(ctx: vscode.ExtensionContext) {
    const mod: any = await import('@huggingface/transformers');
    // Use absolute paths inside the extension:
    mod.env.localModelPath = vscode.Uri.joinPath(ctx.extensionUri, 'models').fsPath;
    mod.env.allowRemoteModels = false; // or false if you want strictly offline
    return { pipeline: mod.pipeline as (task: string, model: string) => Promise<FeatureExtractionPipeline> };
}

async function loadArtifacts(ctx: vscode.ExtensionContext) {
    const artDir = vscode.Uri.joinPath(ctx.extensionUri, 'resources', 'rag-artifacts');

    // FAISS needs a string path:
    const indexFsPath = vscode.Uri.joinPath(artDir, 'kb.index').fsPath;

    // VS Code FS API returns Uint8Array:
    const metaUri = vscode.Uri.joinPath(artDir, 'metadata.json');
    const metaBytes = await vscode.workspace.fs.readFile(metaUri);
    const meta: Meta = JSON.parse(Buffer.from(metaBytes).toString('utf8'));

    const index = IndexFlatIP.read(indexFsPath);
    return { index, meta };
}

// === Embedding / retrieval helpers (unchanged logic) ===
async function embed(question: string, extractor: FeatureExtractionPipeline): Promise<Float32Array> {
    const out = (await extractor([question], { pooling: 'mean', normalize: false })) as Tensor | Tensor[];
    const vec = Array.isArray(out)
        ? (out[0].data as Float32Array)
        : (out.data as Float32Array).subarray(0, (out.dims?.[1] ?? (out.data as Float32Array).length));
    let s = 0; for (let i = 0; i < vec.length; i++) {
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
    k = 5
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
    return labels
        .map((lbl: number, i: number) => ({ lbl, score: distances[i] }))
        .filter((x: { lbl: number; }) => x.lbl >= 0 && x.lbl < meta.length)
        .map((h: { score: any; lbl: any; }) => [h.score, meta[h.lbl]] as const);
}

function formatContext(hits: ReadonlyArray<readonly [number, Meta[number]]>) {
    const blocks = hits.map(([score, rec]) => `[source: ${rec.source} | score: ${score.toFixed(3)}]\n${rec.text}`);
    return blocks.join('\n\n---\n\n');
}

// Public API: take the original prompt (or a condensed query), return TOP-K context text
export async function getRagContext(ctx: vscode.ExtensionContext, question: string, topK = 5): Promise<string> {
    const { pipeline } = await loadTransformers(ctx);
    const extractor = (await pipeline('feature-extraction', MODEL_ID)) as FeatureExtractionPipeline;
    const { index, meta } = await loadArtifacts(ctx);

    const qvec = await embed(question, extractor);
    const hits = retrieve(question, index, meta, qvec, topK);

    // quick diag logs
    console.log('[RAG] meta.len=', meta.length, 'index.ntotal=', index.ntotal());
    type Hit = readonly [number, Meta[number]];

    console.log(
        '[RAG] preview hit sources=',
        hits.slice(0, 3).map((t: Hit) => {
        const [s, r] = t;
        return { s: +s.toFixed(3), src: r.source };
        })
    );

    return formatContext(hits);
}
