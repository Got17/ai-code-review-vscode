import * as vscode from 'vscode';

export function extractSummary(response: string): string {
	const summaryMatch = response.match(/1\. ?(?:🔍)? ?\*\*Summary of Issues\*\*([\s\S]*?)2\. ?/);
	const summaryText = summaryMatch ? summaryMatch[1].trim() : "No summary found.";

	return summaryText;
}

export async function handleUserChoice(summary: string, git: any): Promise<void> {
	const choice = await vscode.window.showInformationMessage(
		`💡 AI Suggestion Summary:\n${summary}`,
		'Accept', 'Reject'
	);

	if (!choice) {
		return;
	}

	try {
		await git.add('./*');
		if (choice === 'Accept') {
			// Later on we can let AI generate the commit name as well
			await git.commit('AI suggestion applied');
			vscode.window.showInformationMessage('✅ Changes committed with message: AI suggestion applied');
		} else {
			vscode.window.showInformationMessage('⚠️ Changes staged but not committed.');
		}
	} catch (err: any) {
		vscode.window.showErrorMessage(`❌ Git operation failed: ${err.message}`);
	}
}

export function showOutput(fileName: string | undefined, response: string): void {
	const outputChannel = vscode.window.createOutputChannel("AI Code Review");
	outputChannel.clear();
	outputChannel.appendLine(`📄 File: ${fileName || 'Unknown'}`);
	outputChannel.appendLine(`\n${response}`);
	outputChannel.show(true);
}

function showWebview(response: string): void {
	const panel = vscode.window.createWebviewPanel(
		'AI Code Review',
		'AI Code Review Suggestions',
		vscode.ViewColumn.One,
		{}
	);
	panel.webview.html = getWebviewContent(response);
}

function getWebviewContent(response: string): string {
	throw new Error('Function not implemented.');
}
