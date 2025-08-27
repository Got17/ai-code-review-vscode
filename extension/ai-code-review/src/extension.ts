import * as vscode from 'vscode';
import { registerShowSuggestion, registerUndoLastSuggestion, registerSetAIPreferences, registerShowAIPreferences, registerClearAIPreferences, registerChangeOllamaModel } from './commands';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		registerShowSuggestion(context),
		registerSetAIPreferences(context),
		registerShowAIPreferences(context),
		registerClearAIPreferences(context),
		registerUndoLastSuggestion(context),
		registerChangeOllamaModel(context)
	);
}

export function deactivate() {}
