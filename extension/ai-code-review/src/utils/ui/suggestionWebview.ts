import * as vscode from 'vscode';
import { handleWebviewMessage, getWebviewContent } from '../webview';
import { WEBVIEW_LIBRARY_DIR } from '../constants';
import { getPanel, setPanel } from './panelManager';
import { getUserPreferences } from '../ai';

export async function showSuggestionWebview(
	_initialResponsePlaceholder: string,
    context: vscode.ExtensionContext,
    fileName: string | undefined,
) {	
	const existingPanel = getPanel();
	const userPreferences = await getUserPreferences(context);

	if (existingPanel) {
        existingPanel.reveal(vscode.ViewColumn.Beside);
		existingPanel.webview.html = getWebviewContent(
            existingPanel.webview, 
            context.extensionUri, 
            fileName,
			userPreferences
        );
		return existingPanel;
    }

	const newPanel = vscode.window.createWebviewPanel(
		'aiSuggestionPanel',
		'AI Code Review Suggestion for WebSharper',
		vscode.ViewColumn.Beside,
		{
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [
				vscode.Uri.joinPath(context.extensionUri, WEBVIEW_LIBRARY_DIR),
				vscode.Uri.joinPath(context.extensionUri, 'src', 'utils', 'webview')
			]
		}
	);

	setPanel(newPanel);

	newPanel.onDidDispose(() => {
		setPanel(undefined);
	}, null, context.subscriptions);

	handleWebviewMessage(newPanel);

	newPanel.webview.html = getWebviewContent(
		newPanel.webview, 
		context.extensionUri, 
		fileName,
		userPreferences
	);
	
	return newPanel;
}