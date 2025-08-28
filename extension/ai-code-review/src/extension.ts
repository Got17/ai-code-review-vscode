import * as vscode from 'vscode';
import { 
	registerShowSuggestion,
	registerSetAIPreferences, 
	registerShowAIPreferences, 
	registerClearAIPreferences, 
	registerChangeOllamaModel,
	registerShowShadowHistory
 } from './commands';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		registerShowSuggestion(context),
		registerSetAIPreferences(context),
		registerShowAIPreferences(context),
		registerClearAIPreferences(context),
		registerChangeOllamaModel(context),
		registerShowShadowHistory(context)
	);
}

export function deactivate() {}
