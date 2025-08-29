import * as vscode from "vscode";
import { createRequire } from "node:module";

const requireCJS = createRequire(__filename);

/* ===== FAISS TYPES & IMPORT ===== */

type FaissSearchResult = { distances: number[]; labels: number[] };

type FaissIndexFlatIP = {
    getDimension(): number;
    ntotal(): number;
    search(vec: number[], k: number): FaissSearchResult;
    constructor: any;
    write: (path: string) => void;
};

const { IndexFlatIP } = requireCJS("faiss-node") as {
    IndexFlatIP: { read: (p: string) => FaissIndexFlatIP };
};

/* ===== DATA TYPES ===== */

export type MetaRec = { 
    id: string; 
    text: string; 
    source: string; 
    title: string 
};
type Meta = MetaRec[];

export type FeatureExtractionPipeline = (
    x: string | string[],
    options?: { pooling?: "mean" | "none"; normalize?: boolean }
) => Promise<any>;

type Tensor = { dims?: number[]; data: Float32Array };

type Hit = readonly [score: number, rec: MetaRec];

/* ===== CONSTANTS ===== */

const MODEL_ID = "Xenova/all-MiniLM-L6-v2";
const DEFAULT_TOP_K = 5;

const MODELS_DIR = "models";
const ARTIFACTS_DIR = ["resources", "rag-artifacts"];
const INDEX_FILE = "kb.index";
const META_FILE = "metadata.json";

/* ===== LIGHTWEIGHT CACHE =====
   Prevents reloading models and FAISS index repeatedly inside a single session. */
const cache = new Map<
    string,
    {
        extractor?: FeatureExtractionPipeline;
        index?: FaissIndexFlatIP;
        meta?: Meta;
    }
>();

/* ===== UTILS ===== */

// L2-normalize a Float32Array.
function l2Normalize(vector: Float32Array): Float32Array {
    // Compute the sum of squared components (||v||²).
    let sumOfSquares = 0;
    for (let i = 0; i < vector.length; i++) {
        sumOfSquares += vector[i] * vector[i];
    }
    // Compute the normalization factor: 1 / sqrt(sum of squares).
    // Add a tiny epsilon to avoid division by zero.
    const normalizationFactor = 1 / (Math.sqrt(sumOfSquares) + 1e-12);

    // Create a new normalized vector (unit length).
    const normalizedVector = new Float32Array(vector.length);
    for (let i = 0; i < vector.length; i++) {
        normalizedVector[i] = vector[i] * normalizationFactor;
    }

    return normalizedVector;
}

// Read a file from VS Code's workspace file system and parse it as JSON.
async function readJson<T>(uri: vscode.Uri, resourceName: string): Promise<T> {
    try {
        // Read raw bytes from the file
        const fileContentsAsBytes = await vscode.workspace.fs.readFile(uri);

        // Convert bytes → string → JSON
        const fileContentsAsString = Buffer.from(fileContentsAsBytes).toString("utf8");
        const parsedJson = JSON.parse(fileContentsAsString) as T;

        return parsedJson;
    } catch (error: any) {
        const errorMessage = error?.message ?? String(error);
        throw new Error(`Failed to read/parse ${resourceName}: ${errorMessage}`);
    }
}

// Join additional path segments onto a base VS Code extension URI.
function joinExtensionPath(baseUri: vscode.Uri, ...relativeSegments: string[]): vscode.Uri {
    return vscode.Uri.joinPath(baseUri, ...relativeSegments);
}

/* ===== LOADERS ===== */

// Configure and load the Hugging Face Transformers pipeline.
async function loadTransformers(
  context: vscode.ExtensionContext
): Promise<{ pipeline: (task: string, model: string) => Promise<FeatureExtractionPipeline> }> {
  // Dynamically import to avoid bundling the whole library eagerly
  const transformersModule: any = await import("@huggingface/transformers");

  // Configure local model directory (e.g., `<extension>/models`)
  const localModelDirectory = joinExtensionPath(context.extensionUri, MODELS_DIR).fsPath;
  transformersModule.env.localModelPath = localModelDirectory;

  // Strict offline mode (set to true if you want to allow downloads)
  transformersModule.env.allowRemoteModels = false;

  return {
    pipeline: transformersModule.pipeline as (
      task: string,
      model: string
    ) => Promise<FeatureExtractionPipeline>,
  };
}

// Load FAISS index and metadata.json from the extension's resources/rag-artifacts folder.
async function loadArtifacts(
    context: vscode.ExtensionContext
): Promise<{ index: FaissIndexFlatIP; meta: Meta }> {
    // Root folder: <extension>/resources/rag-artifacts
    const artifactsDirectory = joinExtensionPath(context.extensionUri, ...ARTIFACTS_DIR);

    // File paths inside the artifacts directory
    const indexFilePath = joinExtensionPath(artifactsDirectory, INDEX_FILE).fsPath;
    const metadataFileUri = joinExtensionPath(artifactsDirectory, META_FILE);

    // Load FAISS index (binary) and metadata.json
    const faissIndex = IndexFlatIP.read(indexFilePath);
    const metadataRecords = await readJson<Meta>(metadataFileUri, META_FILE);

    // Validate consistency between index and metadata
    if (faissIndex.ntotal() !== metadataRecords.length) {
        throw new Error(
        `RAG artifacts mismatch: index.ntotal=${faissIndex.ntotal()} vs metadata.records=${metadataRecords.length}. ` +
            `Rebuild artifacts so they are consistent.`
        );
    }

    return { index: faissIndex, meta: metadataRecords };
}

/* ===== CORE OPS ===== */

// Generate an embedding for a query.
async function embed(
    queryText: string,
    extractor: FeatureExtractionPipeline
): Promise<Float32Array> {
    // Run extractor → returns either a Tensor or [Tensor]
    const extractionResult = (await extractor([queryText], {
        pooling: "mean",
        normalize: false, // we normalize manually
    })) as Tensor | Tensor[];

    // Handle single Tensor vs array of Tensors
    const tensor: Tensor = Array.isArray(extractionResult)
        ? (extractionResult[0] as Tensor)
        : (extractionResult as Tensor);

    // Underlying raw Float32Array from the tensor
    const rawEmbedding = tensor.data as Float32Array;

    // Determine dimensionality (prefer dims[1] if present, otherwise use raw length)
    const embeddingDim = tensor.dims?.[1] ?? rawEmbedding.length;

    // Slice the usable portion of the vector
    const unnormalizedEmbedding = rawEmbedding.subarray(0, embeddingDim);

    // Return normalized vector
    return l2Normalize(unnormalizedEmbedding);
}

// Perform a nearest-neighbor search in FAISS.
function retrieve(
    faissIndex: FaissIndexFlatIP,
    metadataRecords: Meta,
    queryEmbedding: Float32Array,
    topK: number = DEFAULT_TOP_K
): Hit[] {
    const indexDimension = faissIndex.getDimension();
    if (indexDimension !== queryEmbedding.length) {
        throw new Error(
        `FAISS dimension mismatch: index=${indexDimension} vs query=${queryEmbedding.length}`
        );
    }

    // Run FAISS search
    const { distances: similarityScores, labels: neighborIndices } = faissIndex.search(
        Array.from(queryEmbedding),
        Math.min(topK, metadataRecords.length)
    );

    // Collect valid hits
    const hits: Hit[] = [];
    for (let i = 0; i < neighborIndices.length; i++) {
        const neighborIndex = neighborIndices[i];
        if (neighborIndex >= 0 && neighborIndex < metadataRecords.length) {
        const metadataRecord = metadataRecords[neighborIndex];
        hits.push([similarityScores[i], metadataRecord]);
        }
    }

    return hits;
}

// Format retrieval hits into a human-friendly context block string.
function formatContext(hits: ReadonlyArray<Hit>): string {
    const contextBlocks = hits.map(([similarityScore, metadataRecord]) =>
        `[source: ${metadataRecord.source} | score: ${similarityScore.toFixed(3)}]\n${metadataRecord.text}`
    );

    return contextBlocks.join("\n\n---\n\n");
}

/* ===== PUBLIC API ===== */

// Build RAG (Retrieval-Augmented Generation) context text.
export async function getRagContext(
    context: vscode.ExtensionContext,
    queryText: string,
    topK: number = DEFAULT_TOP_K
): Promise<string> {
    const cacheKey = context.extensionUri.toString();
    const cacheEntry = cache.get(cacheKey) ?? {};

    // Load / cache the embedding extractor
    if (!cacheEntry.extractor) {
        const { pipeline } = await loadTransformers(context);
        cacheEntry.extractor = (await pipeline(
            "feature-extraction",
            MODEL_ID
        )) as FeatureExtractionPipeline;
    }

    // Load / cache FAISS index + metadata
    if (!cacheEntry.index || !cacheEntry.meta) {
        const { index: faissIndex, meta: metadataRecords } = await loadArtifacts(context);
        cacheEntry.index = faissIndex;
        cacheEntry.meta = metadataRecords;
    }

    cache.set(cacheKey, cacheEntry);

    // Embed the query
    const queryEmbedding = await embed(queryText, cacheEntry.extractor);

    // Retrieve nearest neighbors
    const retrievalHits = retrieve(cacheEntry.index, cacheEntry.meta, queryEmbedding, topK);

    // Format context
    return formatContext(retrievalHits);
}