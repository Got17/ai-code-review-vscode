import * as vscode from 'vscode';
import { registerShowSuggestion, registerCheckGitStatus, registerUndoLastSuggestion } from './commands';

export function activate(context: vscode.ExtensionContext) {
	console.log('AI Code Review extension is active');

	context.subscriptions.push(
		registerShowSuggestion(context),
		registerCheckGitStatus(),
		registerUndoLastSuggestion()
	);
}

export function deactivate() {}
