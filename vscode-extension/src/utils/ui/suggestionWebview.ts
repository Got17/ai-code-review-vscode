import * as vscode from 'vscode';
import { handleWebviewMessage, getWebviewContent } from '../webview';
import { WEBVIEW_CONTENT_DIR, WEBVIEW_LIBRARY_DIR } from '../constants';
import { getPanel, setPanel } from './panelManager';

export async function showSuggestionWebview(
    context: vscode.ExtensionContext,
    fileName: string | undefined,
) {	
	const existingPanel = getPanel();

	if (existingPanel) {
        existingPanel.reveal(vscode.ViewColumn.Beside);
		existingPanel.webview.html = getWebviewContent(
            existingPanel.webview, 
            context.extensionUri, 
            fileName
        );
		return existingPanel;
    }

	const newPanel = vscode.window.createWebviewPanel(
		'aiSuggestionPanel',
		'WS Code Review',
		vscode.ViewColumn.Beside,
		{
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(context.extensionUri, WEBVIEW_LIBRARY_DIR),
				vscode.Uri.joinPath(context.extensionUri, WEBVIEW_LIBRARY_DIR, 'highlightjs'),
				vscode.Uri.joinPath(context.extensionUri, ...WEBVIEW_CONTENT_DIR)
			]
		}
	);

	setPanel(newPanel);

	newPanel.onDidDispose(() => {
		setPanel(undefined);
	}, null, context.subscriptions);

	handleWebviewMessage(newPanel, context);

	newPanel.webview.html = getWebviewContent(
		newPanel.webview, 
		context.extensionUri, 
		fileName
	);
	
	return newPanel;
}