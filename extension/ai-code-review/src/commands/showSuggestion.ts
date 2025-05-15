import * as vscode from 'vscode';
import { buildPrompt, getGitClient, getSelectedCode, queryDeepSeek } from '../utils/helpers';
import { extractSummary, handleUserChoice, showOutput } from '../utils/showSuggestionHelpers';

export function registerShowSuggestion() {
	return vscode.commands.registerCommand('ai-code-review.showSuggestion', async () => {
		const git = getGitClient();
		if (!git) {
            return;
        }

		const selectedCode = getSelectedCode();
		if (!selectedCode) {
            return;
        }

		const fileName = vscode.window.activeTextEditor?.document.fileName;
		const prompt = buildPrompt(selectedCode, fileName);

		vscode.window.setStatusBarMessage('🤖 Generating AI suggestion...', 5000);

		const response = await queryDeepSeek(prompt);
		if (!response) {
            return;
        }

		let summaryText = extractSummary(response);

		await handleUserChoice(summaryText, git);

		showOutput(fileName, response);
	});
}
