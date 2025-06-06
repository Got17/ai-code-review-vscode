import * as vscode from 'vscode';
import { queryAIStream, buildPrompt }  from '../utils/ai'; 
import { getGitClient } from '../utils/git';
import { showSuggestionWebview, showOutput } from '../utils/ui/';

export function registerShowSuggestion(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('ai-code-review.showSuggestion', async () => {
        // Show status message
        vscode.window.setStatusBarMessage('🤖 Analyzing F# code...', 5000);

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active F# editor found.');
            return;
        }

        const document = editor.document;

        // Check for F# languag
        if (document.languageId !== 'fsharp') {
            vscode.window.showErrorMessage('This command only works on F# files.');
            return;
        }

        const fileName = document.fileName;
        const selection = editor.selection;
        const selectedCode = document.getText(selection);

        // Ensure user has selected some code
        if (selection.isEmpty && !selectedCode) {
            vscode.window.showWarningMessage('Please select some F# code to review.');
            return;
        }

        const wholeFileContent = document.getText();
        const documentUri = document.uri;

        // Prepare prompt for AI
        const prompt = buildPrompt(selectedCode, wholeFileContent, fileName, selection);

        // Check for Git availability
        const git = getGitClient();
        if (!git) {
            vscode.window.showErrorMessage('Git client not available.');
            return;
        }

        // Open suggestion panel
        const suggestionPanel = showSuggestionWebview(
            "",
            context,
            selectedCode,
            wholeFileContent,
            fileName,
            selection,
            documentUri
        );

        if (!suggestionPanel) {
            vscode.window.showErrorMessage("Failed to open suggestion panel.");
            return;
        }

        let accumulatedResponse = '';

        // Stream AI suggestions
        try {
            for await (const chunk of queryAIStream(prompt)) {
                accumulatedResponse += chunk;
                suggestionPanel.webview.postMessage({ command: 'aiChunk', chunk });
            }

            console.log('[ExtensionHost] AI Stream ended. Full response length:', accumulatedResponse.length);
            suggestionPanel.webview.postMessage({ command: 'aiStreamEnd', fullResponse: accumulatedResponse });

            // Show AI output
            showOutput(fileName, accumulatedResponse);
        } catch (error) {
            console.error("Error during AI response streaming:", error);
            vscode.window.showErrorMessage("Error receiving AI suggestion.");

            if (suggestionPanel && suggestionPanel.webview) {
                suggestionPanel.webview.postMessage({ 
                    command: 'aiError', 
                    error: 'Failed to get full response from AI.' 
                });
            }
        }
    });
}