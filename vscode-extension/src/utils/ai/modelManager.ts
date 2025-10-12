import * as vscode from "vscode";
import { DEFAULT_API, AI_MODEL } from "../constants";

const STORAGE_KEYS = {
    model: "ollamaModel",
    api: "ollamaApi",
};

type StringPrefKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Shape returned by Ollama `/api/tags` (minimal fields we care about).
interface OllamaTagsResponse {
    models?: Array<{ 
        name?: string; 
        model?: string 
    } & Record<string, unknown>>;
}

// Get a trimmed string from globalState (or undefined).
function getStringPref(context: vscode.ExtensionContext, key: StringPrefKey): string | undefined {
    const value = context.globalState.get<string>(key);
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

// Set a trimmed string into globalState.
async function setStringPref(context: vscode.ExtensionContext, key: StringPrefKey, value: string) {
    await context.globalState.update(key, value.trim());
}

// Basic timeout wrapper for fetch to avoid hanging forever.
async function fetchWithTimeout(
    url: string,
    opts: RequestInit = {},
    timeoutMs = 5000
): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...opts, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// Derive Ollama base URL from a full API endpoint.
function deriveOllamaBaseUrl(apiEndpoint: string): string {
    const trimmed = apiEndpoint.trim();

    // If it already ends with /api/tags or /api, strip the path to base
    const withoutGenerate = trimmed.replace(/\/api\/generate.*$/i, "");
    const withoutTrailing = withoutGenerate.replace(/\/+$/g, "");
    return withoutTrailing.length > 0 ? withoutTrailing : trimmed;
}

// Resolve current API endpoint (globalState override -> constant).
export function getCurrentApi(context: vscode.ExtensionContext): string {
    return getStringPref(context, STORAGE_KEYS.api) ?? DEFAULT_API;
}

// Save custom API endpoint.
export async function setCurrentApi(context: vscode.ExtensionContext, value: string) {
    await setStringPref(context, STORAGE_KEYS.api, value);
}

// Resolve current model (globalState override -> constant).
export function getCurrentModel(context: vscode.ExtensionContext): string {
    return getStringPref(context, STORAGE_KEYS.model) ?? AI_MODEL;
}

// Save selected model.
export async function setCurrentModel(context: vscode.ExtensionContext, value: string) {
    await setStringPref(context, STORAGE_KEYS.model, value);
}

// Try to list available Ollama models via /api/tags.
export async function listOllamaModels(context: vscode.ExtensionContext): Promise<string[]> {
    const apiEndpoint = getCurrentApi(context);
    const baseUrl = deriveOllamaBaseUrl(apiEndpoint);
    const tagsUrl = `${baseUrl}/api/tags`;

    try {
        const res = await fetchWithTimeout(tagsUrl, { method: "GET" }, 5000);
        if (!res.ok) {
            return [];
        }                                                                                                                                                                                                           

        const json = (await res.json()) as OllamaTagsResponse;
        const raw = Array.isArray(json?.models) ? json.models : [];

        const names = raw
            .map(m => m.model || m.name || "")
            .filter((s): s is string => Boolean(s && s.trim()));

        // Unique & sorted for nicer UX
        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    } catch {
        return [];
    }
}
