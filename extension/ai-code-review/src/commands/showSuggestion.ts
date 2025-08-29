import * as vscode from 'vscode';
import { queryAIStream, buildPrompt, getUserPreferences, UserAbort } from '../utils/ai';
import { showSuggestionWebview, showOutput } from '../utils/ui';
import { getCurrentModel } from '../utils/ai/modelManager';

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
        const { prompt, applyMode } = await buildPrompt(
            selectedCode,
            wholeFileContent,
            fileName,
            selection,
            context
        );

        console.log(prompt);

        // Open the suggestion webview panel
        const suggestionPanel = await showSuggestionWebview('', context, fileName);
        if (!suggestionPanel) {
            vscode.window.showErrorMessage('Failed to open suggestion panel.');
            return;
        }

        const userPreferences = await getUserPreferences(context);
        const currentModel = getCurrentModel(context);

        // Initialize value from extension to webview
        suggestionPanel.webview.postMessage({
            command: 'init',
            wholeFileContent,
            selection: selection ? {
                start: { line: selection.start.line, character: selection.start.character },
                end: { line: selection.end.line, character: selection.end.character }
            } : null,
            documentUri: documentUri?.toString() || null,
            userPreferences,
            currentModel,
            applyMode,
        });

        let accumulatedResponse = '';
        let hadStreamError = false;

        // Stream AI suggestions
        try {
            for await (const chunk of queryAIStream(suggestionPanel, prompt, context)) {
                accumulatedResponse += chunk;
                suggestionPanel.webview.postMessage({ command: 'aiChunk', chunk });
            }

            if (!hadStreamError) {
                suggestionPanel.webview.postMessage({ command: 'aiStreamEnd', fullResponse: accumulatedResponse });
                showOutput(fileName, accumulatedResponse);
            }

        } catch (error: any) {
            if (error instanceof UserAbort || error.name === 'UserAbort') {
                // user stopped: webview already updated; just exit
                return;
            }
            hadStreamError = true;
            console.error('Error during AI response streaming:', error);

            suggestionPanel.webview.postMessage({
                command: 'aiError',
                error: 'Failed to get full response from Ollama. (Make sure Ollama is running)',
            });
        }
    });
}
