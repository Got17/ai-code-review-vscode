import * as vscode from 'vscode';
import { buildPrompt, getSelectedCode, queryDeepSeek } from '../utils/helpers';

export function registerAIReview() {
	return vscode.commands.registerCommand('ai-code-review.aiReview', async () => {
		const selectedCode = getSelectedCode();
		if (!selectedCode) {
            return;
        }

		const fileName = vscode.window.activeTextEditor?.document.fileName;
		const prompt = buildPrompt(selectedCode, fileName);

		console.time('DeepSeek response');
		const response = await queryDeepSeek(prompt);
		console.timeEnd('DeepSeek response');

		if (!response) {
            return;
        }

		const doc = await vscode.workspace.openTextDocument({
			content: response,
			language: 'markdown'
		});

		await vscode.window.showTextDocument(doc, {
			preview: false,
			viewColumn: vscode.ViewColumn.Beside
		});
	});
}
