import * as vscode from "vscode";

export type FeatureExtractionPipeline =
    (x: string | string[], opts?: { pooling?: "mean" | "none"; normalize?: boolean }) => Promise<any>;

export type TransformersMode = "bootstrap" | "local";

// Dynamic import + environment setup for Transformers.js.
export async function getTransformers(
    context: vscode.ExtensionContext,
    mode: TransformersMode
): Promise<{
    env: any,
    pipeline: (task: string, model: string) => Promise<FeatureExtractionPipeline>
}> {
    const module: any = await import("@huggingface/transformers");

    const env = module.env ?? module.default?.env;
    const pipeline = module.pipeline ?? module.default?.pipeline;
    if (!env || !pipeline) {
        throw new Error("Transformers.js: env/pipeline not found (ESM interop).");
    }

    const modelsUri = vscode.Uri.joinPath(context.extensionUri, "models");
    await vscode.workspace.fs.createDirectory(modelsUri);

    env.localModelPath = modelsUri.fsPath;
    env.cacheDir = modelsUri.fsPath;
    env.allowRemoteModels = (mode === "bootstrap");

    return { env, pipeline };
}
