import * as vscode from 'vscode';

export function showOutput(fileName: string | undefined, response: string): void {
	const outputChannel = vscode.window.createOutputChannel("WS Code Review");
	outputChannel.clear();
	outputChannel.appendLine(`File: ${fileName || 'Unknown'}`);
	outputChannel.appendLine(`\n${response}`);
	outputChannel.show(true);
}
