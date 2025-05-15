import * as vscode from 'vscode';
import { getGitClient } from '../utils/helpers';
import { SimpleGit } from 'simple-git';

export function registerUndoLastSuggestion() {
	return vscode.commands.registerCommand('ai-code-review.undoLastSuggestion', async () => {
		const git = getGitClient();
		if (!git) {
            return;
        }

		const confirm = await confirmUndo();
		if (!confirm) {
			return;
		}

		await undoLastCommit(git);
	});
}

async function confirmUndo(): Promise<boolean> {
	const choice = await vscode.window.showInformationMessage(
		'⏪ Do you want to undo the last suggestion?',
		'Yes', 'Cancel'
	);
	return choice === 'Yes';
}

async function undoLastCommit(git: SimpleGit): Promise<void> {
	try {
		await git.raw(['checkout', 'HEAD~1', '--', '.']);
		vscode.window.showInformationMessage('🔄 Last suggestion reverted to previous state.');
	} catch (err: any) {
		vscode.window.showErrorMessage(`❌ Failed to undo: ${err.message}`);
	}
}

