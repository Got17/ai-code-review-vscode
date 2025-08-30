import * as vscode from 'vscode';
import { applySuggestion, abortActiveRequest } from '../ai';
import { listOllamaModels, getCurrentModel, setCurrentModel } from '../ai/modelManager';
import { promptAndShowSuggestion } from '../../commands';
import {
    openShadowRepoForDocument,
    shadowEnsureBaseline,
    shadowCommitFiles
} from '../git/shadowRepo';
import { ApplyMode } from '../constants';

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
                        await handleAccept(context, message, originalSelection, panelInstance);
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

                    case 'refresh':
                        // Open the same document and restore the original selection, then rerun
                        const docUri = vscode.Uri.parse(message.documentUri);
                        const doc = await vscode.workspace.openTextDocument(docUri);
                        const editor = await vscode.window.showTextDocument(doc, {
                            preserveFocus: false,
                            viewColumn: vscode.ViewColumn.One,
                        });

                        if (message.selection) {
                            const selection = new vscode.Selection(
                                new vscode.Position(message.selection.start.line, message.selection.start.character),
                                new vscode.Position(message.selection.end.line, message.selection.end.character)
                            );
                            editor.selection = selection;
                            editor.revealRange(
                                new vscode.Range(selection.start, selection.end), 
                                vscode.TextEditorRevealType.InCenterIfOutsideViewport
                            );
                        }

                        await vscode.commands.executeCommand('extension.showSuggestion');
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
    context: vscode.ExtensionContext,
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
    const workspaceConfig = vscode.workspace.getConfiguration('wsCodeReview');
    const enableShadow = workspaceConfig.get<boolean>('git.enable', false);

    try {
        // Save current state to disk
        let doc = await vscode.workspace.openTextDocument(docUri);
        if (enableShadow && doc.isDirty) { 
            await doc.save(); 
        }

        // Prepare shadow repo 
        let shadow: Awaited<ReturnType<typeof openShadowRepoForDocument>> | undefined;
        if (enableShadow) {
            shadow = await openShadowRepoForDocument(context, docUri);
            await shadowEnsureBaseline(shadow, docUri.fsPath);
        }

        // Apply AI suggestion to editor
        await applySuggestion(message.aiSuggestedCode, originalSelection, docUri, message.applyMode || ApplyMode.Full);

        // Save new content so commit captures it
        doc = await vscode.workspace.openTextDocument(docUri);
        if (enableShadow) { 
            await doc.save(); 
        }

        // Commit in shadow
        if (enableShadow && shadow) {
            const hash = await shadowCommitFiles(context, shadow, [docUri.fsPath], message.aiExplanation);
            vscode.window.setStatusBarMessage(`AI snapshot (shadow): ${hash.slice(0,7)}`, 4000);
        }
    } catch (error: any) {
        vscode.window.showWarningMessage(`Shadow commit failed: ${error?.message ?? String(error)}`);
    }

    panelInstance.dispose();
}