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
			vscode.window.showInformationMessage('Changes committed with message: AI suggestion applied');
		} else {
			vscode.window.showInformationMessage('Changes staged but not committed.');
		}
	} catch (err: any) {
		vscode.window.showErrorMessage(`Git operation failed: ${err.message}`);
	}
}

export function showOutput(fileName: string | undefined, response: string): void {
	const outputChannel = vscode.window.createOutputChannel("AI Code Review");
	outputChannel.clear();
	outputChannel.appendLine(`File: ${fileName || 'Unknown'}`);
	outputChannel.appendLine(`\n${response}`);
	outputChannel.show(true);
}

let panel: vscode.WebviewPanel | undefined = undefined;

export function showWebview(
	response: string, 
	context: vscode.ExtensionContext, 
	originalCode: string | null,
	fileName?: string,
	selection?: vscode.Selection,
  	documentUri?: vscode.Uri
): void {
	const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

	if (panel) {
        console.log('[ShowWebviewDebug] Revealing existing panel.');
        panel.reveal(column);
    } else {
		console.log('[ShowWebviewDebug] Creating new panel.');
		panel = vscode.window.createWebviewPanel(
			'aiSuggestionPanel',
			'AI Code Review (F# and WebSharper)',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		panel.onDidDispose(
            () => {
                console.log('[ShowWebviewDebug] Panel disposed. Setting panel variable to undefined.');
                panel = undefined;
            },
            null,
            context.subscriptions
        );
	}

	const improvedCode = extractImprovedCode(response);						
	if (!improvedCode) {
		return;
	}

	const editor = vscode.window.activeTextEditor;
	if(!editor || !originalCode) {
		return;
	}

	panel.webview.html = getWebviewContent(fileName, originalCode, response, selection, documentUri);
	handleWebviewMessage(response, panel, context, selection, documentUri);
}

function handleWebviewMessage(
	response: string,
	panel: vscode.WebviewPanel,
	context: vscode.ExtensionContext,
	selection?: vscode.Selection,
	documentUri?: vscode.Uri
) {
	panel.webview.onDidReceiveMessage(
		async message => {
			if (message.command === "accept") {
				try {
					const improvedCode = extractImprovedCode(response);						
					if (!improvedCode) {
						return;
					}
					
					await applySuggestion(improvedCode, selection, documentUri);
					panel.dispose();					
				} catch (err) {
					console.log(`Error with accepting: ${err}`);
				}
			}
			else if (message.command === "reject"){
				try {
					logRejection(
						message.fileName,
						message.originalCode,
						message.aiSuggestedCode, 
						message.aiFullResponse,  
						message.selection ? new vscode.Selection( 
							new vscode.Position(message.selection.start.line, message.selection.start.character),
							new vscode.Position(message.selection.end.line, message.selection.end.character)
						) : undefined
					);
					
					panel.dispose();						
				} catch (err) {
					console.log(`Error with rejecting: ${err}`);
				}
			}
		},
		undefined,
		context.subscriptions
	);
}

function extractImprovedCode(response: string) {
	// eslint-disable-next-line curly
	if (!response) return null;

	const improvedCodeRegex = /^(?:.*Improved Code.*?\r?\n)(?:[\s\S]*?)```fsharp\n([\s\S]*?)\n```/im;
	const match = response.match(improvedCodeRegex);

	if (match && match[1]) {
        return match[1].trim();
    } else {
        console.warn("Could not find the 'Improved Code' F# block with the new regex. AI Response was:\n", response);
		
        const simplerCodeBlockRegex = /```fsharp\n([\s\S]*?)\n```/i;
        const simplerMatch = response.match(simplerCodeBlockRegex);
        if (simplerMatch && simplerMatch[1]) {
            console.warn("Falling back to simpler regex, found an F# code block without a clear 'Improved Code' header.");
            return simplerMatch[1].trim();
        }
        vscode.window.showErrorMessage('Could not find the "Improved Code" F# block in the AI response.');
        return null;
    }
}

function getWebviewContent(
	fileName: string | undefined,
    originalCode: string,
    response: string,  
	selection: vscode.Selection | undefined,
  	documentUri: vscode.Uri | undefined
): string {
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
			<button id="accept-button">✅ Accept</button>
			<button id="reject-button">❌ Reject</button>
		</div>
		<script>
			const originalCode = ${JSON.stringify(originalCode)};
			const improvedCodeBlock = ${JSON.stringify(extractImprovedCode(response))};
			const fullAiResponse = ${JSON.stringify(response)};
			const currentFileName = ${JSON.stringify(fileName)};
			const currentSelection = ${JSON.stringify(selection ? { start: { line: selection.start.line, character: selection.start.character }, end: { line: selection.end.line, character: selection.end.character } } : null)};
			const currentDocumentUri = ${JSON.stringify(documentUri ? documentUri.toString() : null)};

			const vscode = acquireVsCodeApi();
			document.getElementById('accept-button').addEventListener('click', () => {
				vscode.postMessage({
					command: 'accept',
					fileName: currentFileName,
					originalCode: originalCode,
					improvedCode: improvedCodeBlock, 
					selection: currentSelection,
					documentUri: currentDocumentUri
				});
			});

			document.getElementById('reject-button').addEventListener('click', () => {
				vscode.postMessage({
					command: 'reject',
					fileName: currentFileName,
					originalCode: originalCode,
					aiSuggestedCode: improvedCodeBlock, 
					aiFullResponse: fullAiResponse,     
					selection: currentSelection,
					documentUri: currentDocumentUri
				});
			});
		</script>
	</body>
	</html>
	
	`;
}


