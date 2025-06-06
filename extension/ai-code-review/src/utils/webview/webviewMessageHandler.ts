import * as vscode from 'vscode';
import { applySuggestion, logFeedback } from '../ai';

export function handleWebviewMessage(
	panelInstance: vscode.WebviewPanel
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
                        await handleReject(message, originalSelection, panelInstance);
                        break;

                    default:
                        console.warn(`Unhandled command received in webview: ${message.command}`);
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

    logFeedback(
        'accepted',
        message.fileName,
        message.originalCode,
        message.aiSuggestedCode,
        message.aiFullResponse,
        originalSelection
    );

    panelInstance.dispose();
}

async function handleReject(
    message: any,
    originalSelection: vscode.Selection,
    panelInstance: vscode.WebviewPanel
) {
    logFeedback(
        'rejected',
        message.fileName,
        message.originalCode,
        message.aiSuggestedCode,
        message.aiFullResponse,
        originalSelection
    );

    panelInstance.dispose();
}