import * as vscode from 'vscode';
import { shadowRevertLast } from '../utils/git/shadowRepo';

export function registerUndoLastSuggestion(context: vscode.ExtensionContext) {
	return vscode.commands.registerCommand('extension.undoLastSuggestion', async () => {
		// Save everything so revert works on disk state
		await vscode.workspace.saveAll();

		const ok = await vscode.window.showInformationMessage('Revert last AI change (shadow)?', 'Yes', 'Cancel');
		if (ok !== 'Yes') {
			return;
		}

		const activeDocUri = vscode.window.activeTextEditor?.document?.uri;
		await shadowRevertLast(context, activeDocUri);
	});
}