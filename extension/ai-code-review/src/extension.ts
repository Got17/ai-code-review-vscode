import * as vscode from 'vscode';
import { buildPrompt, getGitClient, getSelectedCode, queryDeepSeek} from './utils/helpers';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ai-code-review" is now active!');

	// Showing sugestion command
	const showSuggestionCommand = vscode.commands.registerCommand('ai-code-review.showSuggestion', async () => {

		const git = getGitClient();
		if (!git) {
			return;
		}

		const selectedCode = getSelectedCode();
		if (!selectedCode) {
			return;
		}

		const editor = vscode.window.activeTextEditor;
		const fileName = editor?.document.fileName;
		const prompt = buildPrompt(selectedCode, fileName);

		vscode.window.setStatusBarMessage('🤖 Generating AI suggestion...', 3000);

		const response = await queryDeepSeek(prompt);
		if (!response) {
			return;
		}

		// Extract only the "Summary of Issues"
		const summaryMatch = response.match(/1\. ?(?:🔍)? ?\*\*Summary of Issues\*\*([\s\S]*?)2\. ?/);
		const summaryText = summaryMatch ? summaryMatch[1].trim() : "No summary found.";

		vscode.window.showInformationMessage(
			`💡 AI Suggestion Summary:\n${summaryText}`,
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

		// Show full output in Output Panel
		const outputChannel = vscode.window.createOutputChannel("AI Code Review");
		outputChannel.clear();
		outputChannel.appendLine(`📄 File: ${fileName || 'Unknown'}`);
		outputChannel.appendLine(`\n${response}`);
		outputChannel.show(true);
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

	// 
	const aiReviewCommand = vscode.commands.registerCommand('ai-code-review.aiReview', async () => {
		const selectedCode = getSelectedCode();
		if (!selectedCode) {
			return;
		}

		const editor = vscode.window.activeTextEditor;
		const fileName = editor?.document.fileName;
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

	context.subscriptions.push(showSuggestionCommand, checkGitStatusCommand, undoLastSuggestionCommand, aiReviewCommand);
	
}
export function deactivate() {}
