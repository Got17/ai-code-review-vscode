import * as vscode from "vscode";

export type FeatureExtractionPipeline =
    (x: string | string[], opts?: { pooling?: "mean" | "none"; normalize?: boolean }) => Promise<any>;

export type TransformersMode = "bootstrap" | "local";

// Dynamic import + environment setup for Transformers.js.
export async function getTransformers(
    context: vscode.ExtensionContext,
    mode: TransformersMode
): Promise<{
    module: any,
    pipeline: (task: string, model: string) => Promise<FeatureExtractionPipeline>
}> {
    const module: any = await import("@huggingface/transformers");
    const modelsDir = vscode.Uri.joinPath(context.extensionUri, "models").fsPath;

    module.env.localModelPath = modelsDir;
    module.env.cacheDir = modelsDir;
    module.env.allowRemoteModels = (mode === "bootstrap");

    return {
        module,
        pipeline: module.pipeline as any,
    };
}
