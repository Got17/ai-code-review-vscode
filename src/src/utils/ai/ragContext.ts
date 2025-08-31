import * as vscode from 'vscode';
import MiniSearch from 'minisearch';

export type MetaRec = { id: string; text: string; source: string; title: string };
type Meta = MetaRec[];

const ARTIFACTS_DIR = ['resources', 'rag-artifacts'];
const META_FILE = 'metadata.json';

type CacheEntry = {
    index?: MiniSearch<MetaRec>;
    docs?: Meta;
};
const cache = new Map<string, CacheEntry>();

async function readJson<T>(uri: vscode.Uri): Promise<T> {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return JSON.parse(Buffer.from(bytes).toString('utf8')) as T;
}

async function getDocs(context: vscode.ExtensionContext): Promise<Meta> {
    const key = context.extensionUri.toString();
    const entry = cache.get(key) ?? {};
    if (entry.docs) {
        return entry.docs;
    }

    const metaUri = vscode.Uri.joinPath(context.extensionUri, ...ARTIFACTS_DIR, META_FILE);
    const docs = await readJson<Meta>(metaUri);
    cache.set(key, { ...entry, docs });
    return docs;
}

function buildIndex(docs: Meta): MiniSearch<MetaRec> {
    const mini = new MiniSearch<MetaRec>({
        fields: ['text', 'title', 'source'],
        storeFields: ['text', 'title', 'source'],
    });
    mini.addAll(docs);
    return mini;
}

async function getIndex(context: vscode.ExtensionContext): Promise<MiniSearch<MetaRec>> {
    const key = context.extensionUri.toString();
    const entry = cache.get(key) ?? {};
    if (entry.index) {
        return entry.index;
    }

    const docs = await getDocs(context);
    const idx = buildIndex(docs);
    cache.set(key, { ...entry, index: idx });
    return idx;
}

/** Returns a formatted context block or an empty string if RAG is disabled/unavailable. */
export async function getRagContext(
    context: vscode.ExtensionContext,
    queryText: string,
    topK = 5
): Promise<string> {
    const ragEnabled = vscode.workspace.getConfiguration('wsCodeReview').get<boolean>('rag.enable', false);
    if (!ragEnabled || !queryText?.trim()) {
        return '';
    }

    try {
        const idx = await getIndex(context);

        const hits = idx.search(queryText, {
            // BM25+ (defaults are good); helpful tweaks:
            boost: { title: 2 },   // prefer title matches
            prefix: true,          // prefix matching for code tokens
            fuzzy: 0.1,            // small fuzzy tolerance
            combineWith: 'AND',    // all terms should contribute
        }).slice(0, topK);

        if (!hits.length) {
            return '';
        }

        return hits
        .map(h => `[source: ${h.source} | score: ${h.score.toFixed(3)}]\n${h.text}`)
        .join('\n\n---\n\n');
    } catch (e) {
        console.warn('[RAG] MiniSearch failed:', e);
        return '';
    }
}
