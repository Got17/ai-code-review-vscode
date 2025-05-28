import * as vscode from 'vscode';
import * as helpers from '../utils/helpers'; 

import { showOutput, showWebview } from '../utils/showSuggestionHelpers';

export function registerShowSuggestion(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('ai-code-review.showSuggestion', async () => {
        vscode.window.setStatusBarMessage('🤖 Analyzing F# code and generating suggestion...', 20000);

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

        const git = helpers.getGitClient();
        if (!git) {
            vscode.window.showErrorMessage('Git client not available.');
            return;
        }

        const prompt = helpers.buildPrompt(selectedCode, wholeFileContent, fileName, selection);

        console.log(`\nPrompt (selected code):\n ${selectedCode}\n`);
        console.log(`\nPrompt (full file content - first 500 chars):\n ${wholeFileContent.substring(0, 500)}...\n`);

        vscode.window.setStatusBarMessage('🤖 Querying AI for suggestion...', 20000);
        const response = await helpers.queryDeepSeek(prompt);
        vscode.window.setStatusBarMessage('AI Suggestion Received!', 5000);

        if (!response) {
            vscode.window.showErrorMessage('No response from AI.');
            return;
        }

        showOutput(fileName, response);

        const documentUri = document.uri;

        showWebview(
            response,
            context,
			selectedCode,
			wholeFileContent,
			fileName,
			selection,
			documentUri
        );
    });
}