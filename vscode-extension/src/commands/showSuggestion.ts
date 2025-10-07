import * as vscode from 'vscode';
import { queryAIStream, buildPrompt, getUserPreferences, UserAbort } from '../utils/ai';
import { showSuggestionWebview, showOutput } from '../utils/ui';
import { getCurrentModel } from '../utils/ai/modelManager';
import { BIG_FILE_LINE_THRESHOLD } from '../utils/constants';

function expandToWholeLines(doc: vscode.TextDocument, selection: vscode.Selection) {
    const start = new vscode.Position(selection.start.line, 0);
    const endLineText = doc.lineAt(selection.end.line).text;
    const end = new vscode.Position(selection.end.line, endLineText.length);
    return new vscode.Selection(start, end);
}

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
        const rawSel = editor.selection;
        const wholeFileContent = document.getText();
        const lineCount = wholeFileContent.split(/\r?\n/).length;
        const isBig = lineCount >= BIG_FILE_LINE_THRESHOLD;

        const selection = isBig ? expandToWholeLines(document, rawSel) : rawSel;
        const selectedCode = document.getText(selection);
        if (selection.isEmpty || !selectedCode.trim()) {
            vscode.window.showWarningMessage('Please select some F# code to review.');
            return;
        }

        // Build prompt for AI
        const { prompt, applyMode } = await buildPrompt(
            selectedCode,
            wholeFileContent,
            fileName,
            selection,
            context
        );

        console.log('prompt:', prompt);

        // Open the suggestion webview panel
        const suggestionPanel = await showSuggestionWebview(context, fileName);
        if (!suggestionPanel) {
            vscode.window.showErrorMessage('Failed to open suggestion panel.');
            return;
        }

        const userPreferences = await getUserPreferences(context);
        const currentModel = getCurrentModel(context);

        const workspaceConfig = vscode.workspace.getConfiguration('wsCodeReview');
        const ragEnabled = workspaceConfig.get<boolean>('rag.enable', false);

        // Initialize value from extension to webview
        suggestionPanel.webview.postMessage({
            command: 'init',
            wholeFileContent,
            selection: selection ? {
                start: { line: selection.start.line, character: selection.start.character },
                end: { line: selection.end.line, character: selection.end.character }
            } : null,
            documentUri: document.uri?.toString() || null,
            userPreferences,
            currentModel,
            applyMode,
            ragEnabled
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
