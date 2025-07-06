import * as vscode from 'vscode';
import { queryAIStream, buildPrompt } from '../utils/ai';
import { getGitClient } from '../utils/git';
import { showSuggestionWebview, showOutput } from '../utils/ui';

export function registerShowSuggestion(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.showSuggestion', async () => {
        
        // Show status message
        vscode.window.setStatusBarMessage('🤖 Analyzing F# code...', 5000);

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active F# editor found.');
            return;
        }

        const document = editor.document;

        // Ensure the file is an F# file
        if (document.languageId !== 'fsharp') {
            vscode.window.showErrorMessage('This command only works on F# files.');
            return;
        }

        const fileName = document.fileName;
        const selection = editor.selection;
        const selectedCode = document.getText(selection);

        // Ensure the user has selected some code
        if (selection.isEmpty || !selectedCode.trim()) {
            vscode.window.showWarningMessage('Please select some F# code to review.');
            return;
        }

        const wholeFileContent = document.getText();
        const documentUri = document.uri;

        // Build prompt for AI
        const prompt = await buildPrompt(
            selectedCode,
            wholeFileContent,
            fileName,
            selection,
            context
        );

        // Ensure Git is available
        const git = getGitClient();
        if (!git) {
            vscode.window.showErrorMessage('Git client not available.');
            return;
        }

        // Open the suggestion webview panel
        const suggestionPanel = await showSuggestionWebview(
            '',
            context,
            selectedCode,
            wholeFileContent,
            fileName,
            selection,
            documentUri
        );

        if (!suggestionPanel) {
            vscode.window.showErrorMessage('Failed to open suggestion panel.');
            return;
        }

        let accumulatedResponse = '';

        // Stream AI suggestions
        try {
            for await (const chunk of queryAIStream(prompt)) {
                accumulatedResponse += chunk;
                suggestionPanel.webview.postMessage({
                    command: 'aiChunk',
                    chunk,
                });
            }

            suggestionPanel.webview.postMessage({
                command: 'aiStreamEnd',
                fullResponse: accumulatedResponse,
            });

            // Show full AI output
            showOutput(fileName, accumulatedResponse);

        } catch (error) {
            console.error('Error during AI response streaming:', error);
            vscode.window.showErrorMessage('Error receiving AI suggestion.');

            suggestionPanel.webview.postMessage({
                command: 'aiError',
                error: 'Failed to get full response from AI.',
            });
        }
    });
}
