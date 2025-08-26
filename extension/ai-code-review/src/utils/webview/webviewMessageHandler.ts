import * as vscode from 'vscode';
import { applySuggestion, abortActiveRequest } from '../ai';
import { listOllamaModels, getCurrentModel, setCurrentModel } from '../ai/modelManager';
import { promptAndShowSuggestion } from '../../commands';

export function handleWebviewMessage(
	panelInstance: vscode.WebviewPanel,
    context: vscode.ExtensionContext
) {
	panelInstance.webview.onDidReceiveMessage(
        async message => {
            try {
                const originalSelection = new vscode.Selection(
                    new vscode.Position(message.selection.start.line, message.selection.start.character),
                    new vscode.Position(message.selection.end.line, message.selection.end.character)
                );

                switch (message.command) {
                    case 'accept':
                        await handleAccept(message, originalSelection, panelInstance);
                        break;
                    case 'reject':
                        vscode.window.showInformationMessage('AI suggestion rejected.');
                        panelInstance.dispose();
                        break;
                    case 'editPreferences':
                        vscode.commands.executeCommand('extension.setAIPreferences', message.documentUri);
                        break;
                    case 'clearPreferences':
                        vscode.commands.executeCommand('extension.clearAIPreferences', message.documentUri);
                        break;
                    case 'changeModel':
                        vscode.commands.executeCommand('extension.changeOllamaModel', message.documentUri);
                        break;

                    case 'requestModels':
                        await sendModelsList(context, panelInstance);
                        break;
                    
                    case 'setModelDirect':
                        const picked = String(message.model || '').trim();
                        if (!picked) {
                            break;
                        }
                        await setCurrentModel(context, picked);
                        vscode.window.showInformationMessage(`Ollama model set to: ${picked}`);
                        
                        await sendModelsList(context, panelInstance);
                        await promptAndShowSuggestion(message.documentUri);
                        break;

                    case 'stopStream':
                        abortActiveRequest();
                        break;
                    
                    default:
                        console.warn(`Unhandled command received from webview: ${message.command}`);
                        break;
                }
            } catch (err) {
                console.error(`Error handling message from webview: ${err}`);
                vscode.window.showErrorMessage('An error occurred while processing the suggestion.');
            }
        },
        undefined
    );
}

async function sendModelsList(context: vscode.ExtensionContext, panelInstance: vscode.WebviewPanel) {
    const [currentModel, models] = await Promise.all([
        getCurrentModel(context),
        listOllamaModels(context)
    ]);

    panelInstance.webview.postMessage({
        command: 'modelsList',
        currentModel,
        models
    });
}


async function handleAccept(
    message: any,
    originalSelection: vscode.Selection,
    panelInstance: vscode.WebviewPanel
) {
    if (!message.aiSuggestedCode) {
        vscode.window.showErrorMessage('AI did not provide improved code to apply.');
        return;
    }

    if (!message.selection || !message.documentUri) {
        vscode.window.showErrorMessage('Missing selection or document URI for applying suggestion.');
        return;
    }

    const docUri = vscode.Uri.parse(message.documentUri);

    await applySuggestion(message.aiSuggestedCode, originalSelection, docUri);

    panelInstance.dispose();
}