import * as vscode from 'vscode';
import { 
	registerShowSuggestion,
	registerSetAIPreferences, 
	registerShowAIPreferences, 
	registerClearAIPreferences, 
	registerChangeOllamaModel,
	registerShowShadowHistory,
	registerClearShadowHistory
 } from './commands';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		registerShowSuggestion(context),
		registerSetAIPreferences(context),
		registerShowAIPreferences(context),
		registerClearAIPreferences(context),
		registerChangeOllamaModel(context),
		registerShowShadowHistory(context),
		registerClearShadowHistory(context),
	);
}

export function deactivate() {}
