import * as vscode from 'vscode';
import * as helpers from '../utils/helpers';
import { handleUserChoice, showOutput, showWebview } from '../utils/showSuggestionHelpers';

export function registerShowSuggestion(context: vscode.ExtensionContext) {
	return vscode.commands.registerCommand('ai-code-review.showSuggestion', async () => {

		vscode.window.setStatusBarMessage('🤖 Generating AI suggestion...', 20000);

		const git = helpers.getGitClient();
		if (!git) {
            return;
        }

		const selectedCode = helpers.getSelectedCode();
		if (!selectedCode) {
            return;
        }

		const fileName = vscode.window.activeTextEditor?.document.fileName;
		const prompt = helpers.buildPrompt(selectedCode, fileName);

		console.log(`\nPrompt: ${prompt}\n`);

		const response = await helpers.queryDeepSeek(prompt);
		if (!response) {
            return;
        }

		//let summaryText = extractSummary(response);

		// handleUserChoice(summaryText, git);
		showOutput(fileName, response);
		showWebview(context, response, fileName);
	});
}
