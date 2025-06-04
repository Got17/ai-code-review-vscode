import * as vscode from 'vscode';
import * as helpers from '../utils/helpers'; 

import { showOutput, showWebview } from '../utils/showSuggestionHelpers';

export function registerShowSuggestion(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('ai-code-review.showSuggestion', async () => {
        vscode.window.setStatusBarMessage('🤖 Analyzing F# code...', 5000);

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active F# editor found.');
            return;
        }

        if (editor.document.languageId !== 'fsharp') {
            vscode.window.showErrorMessage('This command only works on F# files.');
            return;
        }

        const document = editor.document;
        const fileName = document.fileName;
        const selection = editor.selection;
        const selectedCode = document.getText(selection);

        if (selection.isEmpty && !selectedCode) {
            vscode.window.showWarningMessage('Please select some F# code to review.');
            return;
        }

        const wholeFileContent = document.getText();
        const prompt = helpers.buildPrompt(selectedCode, wholeFileContent, fileName, selection);
        const documentUri = document.uri;

        const git = helpers.getGitClient();
        if (!git) {
            vscode.window.showErrorMessage('Git client not available.');
            return;
        }

        const panel = showWebview(
            "",
            context,
            selectedCode,
            wholeFileContent,
            fileName,
            selection,
            documentUri
        );

        if (!panel) {
            vscode.window.showErrorMessage("Failed to open suggestion panel.");
            return;
        }

        let accumulatedResponse = '';

        try {
            for await (const chunk of helpers.queryAIStream(prompt)) {
                accumulatedResponse += chunk;
                panel.webview.postMessage({ command: 'aiChunk', chunk: chunk });
            }

            console.log('[ExtensionHost] AI Stream ended. Full response length:', accumulatedResponse.length);
            panel.webview.postMessage({ command: 'aiStreamEnd', fullResponse: accumulatedResponse });
            showOutput(fileName, accumulatedResponse);
        } catch (error) {
            console.error("Error during AI response streaming:", error);
            vscode.window.showErrorMessage("Error receiving AI suggestion.");
            if (panel && panel.webview) {
                panel.webview.postMessage({ command: 'aiError', error: 'Failed to get full response from AI.' });
            }
        }
    });
}