import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ai-code-review" is now active!');

	// Showing sugestion command
	const showSuggestionCommand = vscode.commands.registerCommand('ai-code-review.showSuggestion', () => {

		const git = getGitClient();
		if (!git) {
			return;
		}

		const selectedCode = getSelectedCode();
		if (!selectedCode) {
			return;
		}

		vscode.window.showInformationMessage(
			`💡 AI Suggestion: Replace recursion in selected code:\n\n${selectedCode}`,
			'Accept', 'Reject'
		).then(button  => {
			if (button  === 'Accept'){
				git.add('./*')
					.then (() => git.commit('💡 AI suggestion applied'))
					.then(() => {
						vscode.window.showInformationMessage('✅ Changes committed with message: AI suggestion applied');
					})
					.catch(err => {
						vscode.window.showErrorMessage(`❌ Git commit failed: ${err.message}`);
					});
			} else {
				git.add('./*')
					.then(() => {
						vscode.window.showInformationMessage('⚠️ Changes staged but not committed.');
					})
					.catch(err => {
						vscode.window.showErrorMessage(`❌ Git stage failed: ${err.message}`);
					});
			}
		});
	});

	// Checeking git status command
	const checkGitStatusCommand = vscode.commands.registerCommand('ai-code-review.checkGitStatus', () => {
	  
		const git = getGitClient();
		if (!git) {
			return;
		}
	  
		git.status().then((status) => {
		  const staged = status.staged;
		  const notStaged = status.files.filter(f => f.index === '?' || f.working_dir !== ' ');
	  
		  vscode.window.showInformationMessage(
			`📂 Git Status:\n\nStaged: ${staged.length}\nUnstaged: ${notStaged.length}`
		  );
		}).catch(err => {
		  vscode.window.showErrorMessage(`❌ Git status check failed: ${err.message}`);
		});
	  });
	  
	// Undo command
	const undoLastSuggestionCommand = vscode.commands.registerCommand('ai-code-review.undoLastSuggestion', async () => {

		const git = getGitClient();
		if (!git) {
			return;
		}

		const choice = await vscode.window.showInformationMessage(
			'⏪ Do you want to undo the last suggestion?',
			'Yes', 'Cancel'
		);

		if (choice !== 'Yes') {
			return;
		}

		try {
			await git.raw(['checkout', 'HEAD~1', '--', '.']);
			vscode.window.showInformationMessage('🔄 Last suggestion reverted to previous state.');
		} catch (err: any) {
			vscode.window.showErrorMessage(`❌ Failed to undo: ${err.message}`);
		}
	});

	context.subscriptions.push(showSuggestionCommand, checkGitStatusCommand, undoLastSuggestionCommand);

	function getWorkspaceFolder(): string | null {
		const folder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		if (!folder) {
			vscode.window.showErrorMessage('❌ No workspace folder found.');
			return null;
		}
		return folder;
	}

	function getGitClient(): SimpleGit | null {
		const folder = getWorkspaceFolder();
		return folder ? simpleGit({ baseDir: folder }) : null;
	}

	function getSelectedCode(): string | null {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('⚠️ No active editor found.');
			return null;
		}
	
		const selected = editor.document.getText(editor.selection);
		if (!selected) {
			vscode.window.showWarningMessage('📄 Please select some code before running the command.');
			return null;
		}
	
		return selected;
	}
	
}
export function deactivate() {}
