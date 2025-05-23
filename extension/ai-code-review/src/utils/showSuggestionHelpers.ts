import * as vscode from 'vscode';
import {logRejection} from "../utils/logging";
import { applySuggestion } from './applySuggestion';

export async function handleUserChoice(summary: string, git: any): Promise<void> {
	const choice = await vscode.window.showInformationMessage(
		`💡 AI Suggestion Summary:\n${summary}`,
		'Accept', 'Reject'
	);

	if (!choice) {
		return;
	}

	try {
		await git.add('./*');
		if (choice === 'Accept') {
			// Later on we can let AI generate the commit name as well
			await git.commit('AI suggestion applied');
			vscode.window.showInformationMessage('✅ Changes committed with message: AI suggestion applied');
		} else {
			vscode.window.showInformationMessage('⚠️ Changes staged but not committed.');
		}
	} catch (err: any) {
		vscode.window.showErrorMessage(`❌ Git operation failed: ${err.message}`);
	}
}

export function showOutput(fileName: string | undefined, response: string): void {
	const outputChannel = vscode.window.createOutputChannel("AI Code Review");
	outputChannel.clear();
	outputChannel.appendLine(`📄 File: ${fileName || 'Unknown'}`);
	outputChannel.appendLine(`\n${response}`);
	outputChannel.show(true);
}

export function showWebview(
	response: string, 
	context: vscode.ExtensionContext, 
	fileName?: string,
	selection?: vscode.Selection,
  	documentUri?: vscode.Uri
): void {
	const panel = vscode.window.createWebviewPanel(
		'aiSuggestionPanel',
		'AI Code Review (F# and WebSharper)',
		vscode.ViewColumn.Beside,
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);
	panel.webview.html = getWebviewContent(response, fileName);
	handleWebviewMessage(response, panel, context, fileName, selection, documentUri);
}

function handleWebviewMessage(
	response: string,
	panel: vscode.WebviewPanel,
	context: vscode.ExtensionContext,
	fileName?: string,
	selection?: vscode.Selection,
	documentUri?: vscode.Uri
) {
	panel.webview.onDidReceiveMessage(
		async message => {
			console.log("🔥 Received message from Webview:", message);

			if (message.action === "accept") {
				try {
					const improvedCode = extractImprovedCode(response, panel);						
					if (!improvedCode) {
						return;
					}
					
					await applySuggestion(improvedCode, selection, documentUri);
					panel.dispose();					
				} catch (err) {
					console.log(`Error with accepting: ${err}`);
				}
			}
			else if (message.action === "reject"){
				try {
					const improvedCode = extractImprovedCode(response, panel);
					console.log(`Improved code: ${improvedCode}`);	
					if (!improvedCode) {
						return;
					}
					logRejection(response, fileName, improvedCode);

					vscode.window.showInformationMessage("Reject suggestion"); 	
					
				} catch (err) {
					console.log(`Error with rejecting: ${err}`);
				}
			}
		},
		undefined,
		context.subscriptions
	);
}

function extractImprovedCode(response: string, panel: vscode.WebviewPanel) {
	console.log("Attempting to extract improved code...");
	const improvedCodeMatch = response.match(/Improved Code\s*\*\*[\s\S]*?```fsharp\s*([\s\S]*?)```/i);
	console.log(`Improved code: ${improvedCodeMatch}`);

	if (!improvedCodeMatch || improvedCodeMatch.length < 2) {
		vscode.window.showErrorMessage('Could not find the "Improved Code" F# block');
		return;
	}

	return improvedCodeMatch[1].trim();
}

function getWebviewContent(response: string, fileName?: string): string {
	const escaped = response
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/```fsharp([\s\S]*?)```/g, (_, code) => 
            `<pre><code class="language-fsharp">${code.trim()}</code></pre>`
        )
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
		.replace(/`([^`]+?)`/g, '<code>$1</code>');

	return `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>AI Code Review (F# and WebSharper)</title>
		<style>
			body {
				font-family: "Segoe UI", sans-serif;
				padding: 1rem;
				line-height: 1.6;
				color: #d4d4d4;
				background-color: #1e1e1e;
			}
			code {
				background-color: #2d2d2d;
				padding: 0.2rem 0.4rem;
				border-radius: 3px;
				font-family: Consolas, monospace;
				font-size: 0.95em;
			}
			pre {
				background: #2d2d2d;
				padding: 1rem;
				overflow-x: auto;
				border-radius: 5px;
			}
			h2 { color: #79c0ff; }
			.file { font-size: 0.9em; opacity: 0.6; }
			.buttons {
				margin-top: 1rem;
			}
			button {
				background: #0e639c;
				color: white;
				border: none;
				padding: 0.5rem 1rem;
				border-radius: 4px;
				margin-right: 1rem;
				cursor: pointer;
			}
			button:hover {
				background: #1177bb;
			}
		</style>
	</head>
	<body>
		<div class="file">📄 File: ${fileName || 'Unknown'}</div>
		<hr>
		${escaped}
		<div class="buttons">
			<button type="button" onclick="acquireVsCodeApi().postMessage({ action: 'accept' })">✅ Accept</button>
			<button type="button" onclick="acquireVsCodeApi().postMessage({ action: 'reject' })">❌ Reject</button>
		</div>
	</body>
	</html>
	
	`;
}


