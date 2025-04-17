import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import { stat } from 'fs';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ai-code-review" is now active!');

	// Showing sugestion command
	const showSuggestionCommand = vscode.commands.registerCommand('ai-code-review.showSuggestion', () => {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

		if (!workspaceFolder) {
			vscode.window.showErrorMessage('❌ No workspace folder found.');
			return;
		}

		const git = simpleGit({ baseDir: workspaceFolder });

		const editor = vscode.window.activeTextEditor;

		if(!editor){
			vscode.window.showErrorMessage('⚠️ No active editor found.');
			return;
		}

		const selection = editor.selection;
		const selectedCode = editor.document.getText(selection);

		if(!selectedCode) {
			vscode.window.showWarningMessage('📄 Please select some code before running the command.');
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
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		if (!workspaceFolder) {
		  vscode.window.showErrorMessage('❌ No workspace folder found.');
		  return;
		}
	  
		const git = simpleGit({ baseDir: workspaceFolder });
	  
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
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

		if (!workspaceFolder) {
			vscode.window.showErrorMessage('❌ No workspace folder found.');
			return;
		}

		const git = simpleGit({ baseDir: workspaceFolder });

		const choice = await vscode.window.showInformationMessage(
			'⏪ Do you want to undo the last suggestion?',
			'Yes', 'Cancel'
		);

		if (choice !== 'Yes') {
			return;
		}

		try {
			await git.raw(['--source=HEAD~1', '--staged', '--worktree', '.']);
			vscode.window.showInformationMessage('🔄 Last suggestion reverted to previous state.');
		} catch (err: any) {
			vscode.window.showErrorMessage(`❌ Failed to undo: ${err.message}`);
		}
	});

	context.subscriptions.push(showSuggestionCommand, checkGitStatusCommand, undoLastSuggestionCommand);
}
export function deactivate() {}
