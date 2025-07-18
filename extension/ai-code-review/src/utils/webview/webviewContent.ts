import * as vscode from 'vscode';
import * as fs from 'fs';
import { WEBVIEW_LIBRARY_DIR } from '../constants';

export function getWebviewContent(
	webview: vscode.Webview,           
    extensionUri: vscode.Uri,
	fileName: string | undefined,
	userPreferences: string
): string {
	const nonce = new Date().getTime() + '' + new Date().getMilliseconds();

	const htmlPath = vscode.Uri.joinPath(extensionUri, 'src', 'utils', 'webview', 'index.html');
	let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

	const diffJsSrcUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, 'diff.min.js'));
	const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'utils', 'webview', 'style.css'));
	const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'utils', 'webview', 'script.js'));

	htmlContent = htmlContent
		.replace('{{fileName}}', escapeHtml(fileName || 'N/A'))
		.replace('{{userPreferences}}', escapeHtml(userPreferences || 'None set.'))
		.replace('{{styleUri}}', cssUri.toString())
		.replace('{{scriptUri}}', jsUri.toString())
		.replace('{{diffJsSrc}}', diffJsSrcUri.toString())
		.replace(/{{cspSource}}/g, webview.cspSource)
		.replace(/{{nonce}}/g, nonce);

	return htmlContent;
}

function escapeHtml(raw: string): string {
	return raw
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}