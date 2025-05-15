import * as vscode from 'vscode';
import { registerShowSuggestion } from './commands/showSuggestion';
import { registerCheckGitStatus } from './commands/checkGitStatus';
import { registerUndoLastSuggestion } from './commands/undoLastSuggestion';

export function activate(context: vscode.ExtensionContext) {
	console.log('AI Code Review extension is active');

	context.subscriptions.push(
		registerShowSuggestion(),
		registerCheckGitStatus(),
		registerUndoLastSuggestion()
	);
}

export function deactivate() {}
