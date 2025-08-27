import * as vscode from 'vscode';
import { shadowRevertLast } from '../utils/git/shadowRepo';

export function registerUndoLastSuggestion(context: vscode.ExtensionContext) {
	return vscode.commands.registerCommand('extension.undoLastSuggestion', async () => {
		const ok = await vscode.window.showInformationMessage('Revert last AI change (shadow)?', 'Yes', 'Cancel');
		if (ok !== 'Yes') {
			return;
		}

		await vscode.workspace.saveAll();
		
		await shadowRevertLast(context);
	});
}