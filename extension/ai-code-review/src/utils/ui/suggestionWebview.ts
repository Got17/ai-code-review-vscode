import * as vscode from 'vscode';
import { handleWebviewMessage, getWebviewContent } from '../webview';
import { WEBVIEW_LIBRARY_DIR } from '../constants';
import { getPanel, setPanel } from './panelManager';

export function showSuggestionWebview(
	_initialResponsePlaceholder: string,
    context: vscode.ExtensionContext,
    selectedCodeSnippet: string | null,
    entireFileContent: string,
    fileName: string | undefined,
    selection: vscode.Selection,
    documentUri: vscode.Uri
): vscode.WebviewPanel | undefined {	
	const existingPanel = getPanel();

	if (existingPanel) {
        existingPanel.reveal(vscode.ViewColumn.Beside);
		existingPanel.webview.html = getWebviewContent(
            existingPanel.webview, 
            context.extensionUri, 
            fileName,
            selectedCodeSnippet,
            entireFileContent,
            selection,
            documentUri
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
			localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, WEBVIEW_LIBRARY_DIR)]
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
		selectedCodeSnippet,
		entireFileContent,
		selection,
		documentUri
	);
	
	return newPanel;
}