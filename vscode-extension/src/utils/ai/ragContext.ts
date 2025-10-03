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
    const docsIndex = buildIndex(docs);
    cache.set(key, { ...entry, index: docsIndex });
    return docsIndex;
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
        const contextIndex = await getIndex(context);

        const searchOptions = {
            boost: { title: 2 },
            prefix: true,
            fuzzy: 0.1 as const,
        };

        // Precise search (AND)
        const hitsAND = contextIndex.search(queryText, { ...searchOptions, combineWith: 'AND' });
        
        let hits = hitsAND.slice(0, topK);

        // If fewer than k, backfill with OR (looser) and dedupe by id
        if (hits.length < topK) {
            const hitsOR = contextIndex.search(queryText, { ...searchOptions, combineWith: 'OR' });
            const seen = new Set(hits.map(hit => (hit as any).id ?? hit.id));

            for (const hit of hitsOR) {
                const id = (hit as any).id ?? hit.id;

                if (!seen.has(id)) {
                    hits.push(hit);
                    seen.add(id);

                    if (hits.length >= topK) {
                        break;
                    }
                }
            }
        }

        if (!hits.length) {
            return '';
        }

        return hits
            .slice(0, topK)
            .map(h => `[source: ${h.source} | score: ${h.score.toFixed(3)}]\n${h.text}`)
            .join('\n\n---\n\n');

    } catch (e) {
        console.warn('[RAG] MiniSearch failed:', e);
        return '';
    }
}
