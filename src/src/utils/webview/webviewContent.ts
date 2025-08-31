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

	// DiffJs Library URI
	const diffJsSrcUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, 'diff.min.js'));

	// MarkedJs Library URI
	const markedJsSrcUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, 'marked.min.js'));

	// HighlightJs Library URI
	const githubDarkStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, 'highlightjs', 'github-dark.min.css'));
	const highlightJsSrcUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, 'highlightjs', 'highlight.min.js'));
	const fSharpSrcUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, WEBVIEW_LIBRARY_DIR, 'highlightjs', 'fsharp.min.js'));

	const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'utils', 'webview', 'style.css'));
	const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'utils', 'webview', 'script.js'));

	htmlContent = htmlContent
		.replace('{{fileName}}', escapeHtml(fileName || 'N/A'))
		.replace('{{styleUri}}', cssUri.toString())
		.replace('{{scriptUri}}', jsUri.toString())
		.replace('{{diffJsSrc}}', diffJsSrcUri.toString())
		.replace('{{markedJsSrc}}', markedJsSrcUri.toString())
		.replace('{{githubDarkStyle}}', githubDarkStyleUri.toString())
		.replace('{{highlightJsSrc}}', highlightJsSrcUri.toString())
		.replace('{{fSharpSrc}}', fSharpSrcUri.toString())
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