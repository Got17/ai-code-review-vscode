import * as vscode from "vscode";
import {
    getCurrentApi,
    getCurrentModel,
    listOllamaModels,
    setCurrentApi,
    setCurrentModel,
} from "../utils/ai/modelManager";

const CMD_CHANGE_MODEL = "extension.changeOllamaModel";
const CMD_SHOW_SUGGESTION = "extension.showSuggestion";
const DEFAULT_API = "http://localhost:11434/api/generate";

type PickItem = vscode.QuickPickItem & { value?: string };

export function registerChangeOllamaModel(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand(
        CMD_CHANGE_MODEL,
        async (documentUri?: string) => {
            try {
                const api = await pickEndpoint(context);
                if (!api) {
                    return; // canceled
                }
                await setCurrentApi(context, api);

                const model = await pickModel(context);
                if (!model) {
                    return; // canceled
                }
                await setCurrentModel(context, model);

                vscode.window.showInformationMessage(`Ollama model set to: ${model}`);

                // Optional quick rerun
                if (documentUri) {
                    const go = await vscode.window.showInformationMessage(
                        `Run "Show Suggestion" now with the new model?`,
                        "Yes",
                        "No"
                    );
                    if (go === "Yes") {
                        const doc = await vscode.workspace.openTextDocument(
                            vscode.Uri.parse(documentUri)
                        );
                        await vscode.window.showTextDocument(doc, {
                            preserveFocus: false,
                            viewColumn: vscode.ViewColumn.One,
                        });
                        await vscode.commands.executeCommand(CMD_SHOW_SUGGESTION);
                    }
                }
            } catch (err: any) {
                vscode.window.showErrorMessage(
                    `Failed to change Ollama model: ${err?.message ?? String(err)}`
                );
            }
        }
    );
}

/** Ask user to keep or enter endpoint */
async function pickEndpoint(context: vscode.ExtensionContext): Promise<string | undefined> {
    const current = getCurrentApi(context) || DEFAULT_API;

    const choice = await vscode.window.showQuickPick<PickItem>(
        [
            { label: "Use current endpoint", description: current, value: current },
            {
                label: "Enter custom endpoint…",
                description: "e.g. http://localhost:11434/api/generate",
            },
        ],
        { placeHolder: "Select Ollama endpoint" }
    );
    if (!choice) {
        return;
    }

    // If custom, prompt; else return current
    if (!choice.value) {
        const entered = await vscode.window.showInputBox({
            prompt: "Ollama Generate API endpoint",
            value: current,
            validateInput: (v) => (v.trim() ? undefined : "Endpoint is required"),
        });
        return entered?.trim();
    }
    return choice.value;
}

/** List models or let user enter one */
async function pickModel(context: vscode.ExtensionContext): Promise<string | undefined> {
    const [current, models] = await Promise.all([
        getCurrentModel(context),
        listOllamaModels(context),
    ]);

    const discovered = models.map<PickItem>((m) => ({ label: m, value: m }));
    const items: PickItem[] = [
        ...discovered,
        {
            label: "Enter custom model…",
            description: "Type any local Ollama model tag",
        },
    ];

    const picked = await vscode.window.showQuickPick(items, {
        placeHolder: models.length
            ? `Select model (current: ${current})`
            : `No models found. Enter a custom model (current: ${current}).`,
        matchOnDescription: true,
    });
    if (!picked) {
        return;
    }

    // If custom, prompt; else return picked
    if (!picked.value) {
        const manual = await vscode.window.showInputBox({
            prompt: "Enter the Ollama model tag",
            value: current,
            validateInput: (v) => (v.trim() ? undefined : "Model is required"),
        });
        return manual?.trim();
    }
    return picked.value;
}
