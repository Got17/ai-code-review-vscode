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

/** 
 * L2-normalize a Float32Array.
 * 
 * Normalization rescales the vector so that its magnitude (length) = 1. 
 * This is often used before cosine similarity or dot-product similarity.
 */
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

/**
 * Read a file from VS Code's workspace file system and parse it as JSON.
 * 
 * @param uri - The VS Code URI of the file to read.
 * @param resourceName - A human-readable label for error messages (e.g., "metadata.json").
 */
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

/**
 * Join additional path segments onto a base VS Code extension URI.
 */
function joinExtensionPath(baseUri: vscode.Uri, ...relativeSegments: string[]): vscode.Uri {
    return vscode.Uri.joinPath(baseUri, ...relativeSegments);
}

/* ===== LOADERS ===== */

/**
 * Configure and load the Hugging Face Transformers pipeline.
 * 
 * - Sets the local model storage directory inside the extension.
 * - Disables remote model downloads (strict offline mode).
 * 
 * @param context - The VS Code extension context.
 * @returns An object exposing the `pipeline` factory function.
 */
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

/**
 * Load FAISS index and metadata.json from the extension's resources/rag-artifacts folder.
 * Ensures that the index size matches the metadata length for consistency.
 *
 * @param context - The VS Code extension context.
 * @returns The loaded FAISS index and metadata records.
 */
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

/**
 * Generate an embedding for a natural-language query.
 *
 * - Calls the Hugging Face feature-extraction pipeline.
 * - Uses pooling="mean" (average over token embeddings).
 * - Manually L2-normalizes the vector for cosine similarity (dot product).
 *
 * @param queryText - The input question or query.
 * @param extractor - The Hugging Face feature-extraction pipeline.
 * @returns A normalized embedding vector (unit-length Float32Array).
 */
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

/**
 * Perform a nearest-neighbor search in FAISS.
 *
 * - Takes a normalized query embedding.
 * - Searches the FAISS index for the top-k most similar vectors.
 * - Returns pairs of [similarityScore, metadataRecord].
 *
 * @param faissIndex - The FAISS index containing document embeddings.
 * @param metadataRecords - The associated metadata (must align 1-to-1 with index entries).
 * @param queryEmbedding - The normalized embedding of the input query.
 * @param topK - Number of neighbors to retrieve (default = DEFAULT_TOP_K).
 * @returns Array of [score, metadataRecord] hits.
 */
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

/**
 * Format retrieval hits into a human-friendly context block string.
 *
 * Each block includes:
 *   - The source identifier
 *   - The similarity score (3 decimal places)
 *   - The original text
 *
 * Blocks are separated by "\n\n---\n\n".
 *
 * @param hits - Array of [similarityScore, metadataRecord].
 * @returns A formatted string for LLM context injection.
 */
function formatContext(hits: ReadonlyArray<Hit>): string {
    const contextBlocks = hits.map(([similarityScore, metadataRecord]) =>
        `[source: ${metadataRecord.source} | score: ${similarityScore.toFixed(3)}]\n${metadataRecord.text}`
    );

    return contextBlocks.join("\n\n---\n\n");
}

/* ===== PUBLIC API ===== */

/**
 * Build RAG (Retrieval-Augmented Generation) context text for a natural-language query.
 *
 * Workflow:
 *  1. Load (and cache) the Hugging Face embedding model.
 *  2. Load (and cache) the FAISS index + metadata artifacts.
 *  3. Embed the query text into a normalized vector.
 *  4. Retrieve the top-K nearest neighbors from FAISS.
 *  5. Format them into a human-readable context string.
 *
 * @param context   VS Code extension context
 * @param queryText Natural language query to embed & retrieve against
 * @param topK      Number of chunks to retrieve (default = DEFAULT_TOP_K)
 * @returns Formatted context string for LLM prompt injection
 */
export async function getRagContext(
    context: vscode.ExtensionContext,
    queryText: string,
    topK: number = DEFAULT_TOP_K
): Promise<string> {
    const cacheKey = context.extensionUri.toString();
    const cacheEntry = cache.get(cacheKey) ?? {};

    /** Load / cache the embedding extractor */
    if (!cacheEntry.extractor) {
        const { pipeline } = await loadTransformers(context);
        cacheEntry.extractor = (await pipeline(
            "feature-extraction",
            MODEL_ID
        )) as FeatureExtractionPipeline;
    }

    /** Load / cache FAISS index + metadata */
    if (!cacheEntry.index || !cacheEntry.meta) {
        const { index: faissIndex, meta: metadataRecords } = await loadArtifacts(context);
        cacheEntry.index = faissIndex;
        cacheEntry.meta = metadataRecords;
    }

    cache.set(cacheKey, cacheEntry);

    /** Embed the query */
    const queryEmbedding = await embed(queryText, cacheEntry.extractor);

    /** Retrieve nearest neighbors */
    const retrievalHits = retrieve(cacheEntry.index, cacheEntry.meta, queryEmbedding, topK);

    /** Format context */
    return formatContext(retrievalHits);
}