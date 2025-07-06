import * as vscode from 'vscode';
import { getGitClient } from '../utils/git';

export function registerCheckGitStatus() {
	return vscode.commands.registerCommand('extension.checkGitStatus', () => {
		const git = getGitClient();
		if (!git) {
            return;
        }

        checkGitStatus(git);

		git.status()
			.then(status => {
				const staged = status.staged;
				const notStaged = status.files.filter(f => f.index === '?' || f.working_dir !== ' ');
				vscode.window.showInformationMessage(
					`📂 Git Status:\n\nStaged: ${staged.length}\nUnstaged: ${notStaged.length}`
				);
			})
			.catch(err => {
				vscode.window.showErrorMessage(`❌ Git status check failed: ${err.message}`);
			});
	});
}

async function checkGitStatus(git: any): Promise<void> {
	try {
		const status = await git.status();

		const staged = status.staged || [];
		const notStaged = status.files.filter(
			(f: any) => f.index === '?' || f.working_dir !== ' '
		);

		vscode.window.showInformationMessage(
			`📂 Git Status:\n\nStaged: ${staged.length}\nUnstaged: ${notStaged.length}`
		);
	} catch (err: any) {
		vscode.window.showErrorMessage(`❌ Git status check failed: ${err.message}`);
	}
}
