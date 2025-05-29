import * as vscode from 'vscode';
import { logRejection } from "../utils/logging";
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
	_initialResponsePlaceholder: string,
    context: vscode.ExtensionContext,
    originalSelectedCode: string | null,
    originalWholeFileContent: string,
    fileName: string | undefined,
    selection: vscode.Selection,
    documentUri: vscode.Uri
): vscode.WebviewPanel | undefined {
	const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : vscode.ViewColumn.Beside;

	if (panel) {
        console.log('[ShowWebviewDebug] Revealing existing panel.');
        panel.reveal(column);
    } else {
		console.log('[ShowWebviewDebug] Creating new panel.');
		panel = vscode.window.createWebviewPanel(
			'aiSuggestionPanel',
			'AI Code Review',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: []
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
		handleWebviewMessage(panel);
	}
	if(!originalSelectedCode) {
		console.log('[ShowWebviewDebug] No original code selected.');
		return;
	}

	panel.webview.html = getWebviewContent(
        fileName,
        originalSelectedCode,
        originalWholeFileContent,
        selection,
        documentUri
    );
	
	return panel;
}

function handleWebviewMessage(
	panelInstance: vscode.WebviewPanel
) {
	panelInstance.webview.onDidReceiveMessage(
		async message => {
			console.log(`[ExtensionHost] Received message from Webview in handleWebviewMessage:`, message.command);
			if (message.command === "accept") {
				try {
					if (message.improvedCode === null || message.improvedCode === undefined) {
						vscode.window.showErrorMessage('AI did not provide improved code to apply.');
						return;
					}
					if (!message.selection || !message.documentUri) {
						vscode.window.showErrorMessage('Missing selection or document URI for applying suggestion.');
						return;
					}

					const originalSelection = new vscode.Selection(
						new vscode.Position(message.selection.start.line, message.selection.start.character),
						new vscode.Position(message.selection.end.line, message.selection.end.character)
					);
					const docUri = vscode.Uri.parse(message.documentUri);

					await applySuggestion(message.improvedCode, originalSelection, docUri);
					
					if (panelInstance && !panelInstance.visible) { 
                        panelInstance.dispose();
                    } else if (panel) { 
                        panel.dispose();
                    }
				} catch (err) {
					console.error(`Error with accepting: ${err}`);
                    vscode.window.showErrorMessage('Error applying suggestion');
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
					
					if (panelInstance && !panelInstance.visible) {
						panelInstance.dispose();
                    } else if (panel) {
						panel.dispose();
                    } 						
				} catch (err) {
					console.error(`Error with rejecting: ${err}`);
					vscode.window.showErrorMessage('Error logging rejection');
				}
			}
		},
		undefined
	);
}

function getWebviewContent(
	fileName: string | undefined,
    originalSelectedCodeString: string | null,
    originalWholeFileContentString: string, 
    selectionObject: vscode.Selection | undefined,
    documentUriObject: vscode.Uri | undefined
): string {
	const css = webviewCss();
	const html = webviewHtml(fileName);
	const js = webviewJs(fileName, originalSelectedCodeString, originalWholeFileContentString, selectionObject,documentUriObject);

	return `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>AI Code Review</title>
		<style>
			${css}
		</style>
	</head>
	<body>
		${html}

		<script>
			${js}
		</script>
	</body>
	</html>
	
	`;
}

function webviewCss(): string {
	return `
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
		white-space: pre-wrap; 
	}
	h1, h2, h3 { 
		color: #79c0ff; 
		margin-top: 1.5em; 
		margin-bottom: 0.5em; 
	}
	hr { 
		border-color: #444; 
		margin-top: 1em; 
		margin-bottom: 1em;
	}
	.file-info { 
		font-size: 0.9em; 
		opacity: 0.7; 
		margin-bottom: 1em; 
	}
	.buttons { 
		margin-top: 1.5rem; 
		padding-top: 1rem; 
		border-top: 1px solid #444;
	}
	button { 
		background: #0e639c; 
		color: white; 
		border: none; 
		padding: 0.6rem 1.2rem; 
		border-radius: 4px; 
		margin-right: 1rem; 
		cursor: pointer; 
		font-size: 0.9em;}
	button:hover { 
		background: #1177bb; 
	}
	button:disabled { 
		background-color: #555; 
		color: #999; 
		cursor: not-allowed; 
	}
	#streaming-response-area { 
		white-space: pre-wrap;
		margin-bottom: 1rem; 
		padding: 10px; 
		background-color: #252526; 
		border-radius: 4px; 
		min-height: 50px;
	}
	.loading-text { 
		font-style: italic; 
		color: #888; 
	}
	.final-content-section { 
		margin-bottom: 15px; 
		padding: 10px; 
		border: 1px solid #333; 
		border-radius: 4px; 
		background-color: #252526; 
	}
	.final-content-section h2 { 
		margin-top: 0; 
		font-size: 1.1em; 
	}
	.markdown-content p { 
		margin-top: 0.5em; 
		margin-bottom: 0.5em; 
	} 
	.markdown-content strong { 
		font-weight: bold; 
		color:rgb(255, 255, 255); 
	}
	`;
}

function webviewHtml(fileName: string | undefined): string {
	return `
		<div class="file-info">📄 File: ${fileName || 'N/A'}</div>
        <hr>
		
		<div id="streaming-response-area" class="loading-text">🤖 AI is generating suggestion, please wait... (response will stream here)</div>

		<div id="final-response-display" style="display: none;">
            <div id="summary-section" class="final-content-section">
                <h2>1. Summary of Issues:</h2>
                <div id="summary-content-rendered" class="markdown-content"></div>
            </div>
            <div id="improved-code-section" class="final-content-section">
                <h2>2. Improved Code (Full File):</h2>
                <pre><code id="improved-code-content"></code></pre>
            </div>
            <div id="explanation-section" class="final-content-section">
                <h2>3. Explanation:</h2>
                <div id="explanation-content-rendered" class="markdown-content"></div>
            </div>
        </div>

		<div class="buttons">
            <button id="accept-button" disabled>✅ Accept & Replace File</button>
            <button id="reject-button" disabled>❌ Reject Suggestion</button>
        </div>
	`;
}

function webviewJs(
	fileName: string | undefined,
    originalSelectedCodeString: string | null,
    originalWholeFileContentString: string, 
    selectionObject: vscode.Selection | undefined,
    documentUriObject: vscode.Uri | undefined
): string {
	return `
		const vscode = acquireVsCodeApi();
		let accumulatedRawResponse = '';
		const streamingResponseArea = document.getElementById('streaming-response-area');
		const finalResponseDisplay = document.getElementById('final-response-display');

		const summaryContentRenderedEl = document.getElementById('summary-content-rendered');
		const improvedCodeContentEl = document.getElementById('improved-code-content');
		const explanationContentRenderedEl = document.getElementById('explanation-content-rendered');

		const acceptButton = document.getElementById('accept-button');
		const rejectButton = document.getElementById('reject-button');

		let extractedAISuggestedCode = null; 
		let finalAccumulatedResponseForLog = '';

		const jsOriginalSelectedCode = ${JSON.stringify(originalSelectedCodeString)};
		const jsOriginalWholeFileContent = ${JSON.stringify(originalWholeFileContentString)};
		const jsCurrentFileName = ${JSON.stringify(fileName)};
		const jsCurrentSelection = ${JSON.stringify(selectionObject ? { start: { line: selectionObject.start.line, character: selectionObject.start.character }, end: { line: selectionObject.end.line, character: selectionObject.end.character } } : null)};
		const jsCurrentDocumentUri = ${JSON.stringify(documentUriObject ? documentUriObject.toString() : null)};

		function extractImprovedCodeJS(aiFullResponse) {
			if (!aiFullResponse) return null;
			const improvedCodeRegex = /(?:[\\s\\S].*?)?\\\`\\\`\\\`fsharp\\n([\\s\\S]*?)\\n(?:[\\s\\S].*?)?\\\`\\\`\\\`/im;

			const match = aiFullResponse.match(improvedCodeRegex);
			if (match && match[1]) {
				console.log("JS: Main 'Improved Code' regex matched.");
				return match[1].trim();
			}
			
			console.warn("Main regex failed in JS. Trying simpler fallback for Improved Code block.");
			const simplerCodeBlockRegex = /\\\`\\\`\\\`fsharp\\n([\\s\\S]*?)\\n\\\`\\\`\\\`/i;
			const simplerMatch = aiFullResponse.match(simplerCodeBlockRegex);
			if (simplerMatch && simplerMatch[1]) {
				console.log("JS: Simpler fallback 'Improved Code' regex matched.");
				return simplerMatch[1].trim();
			}
			console.error("JS: Could not find the 'Improved Code' F# block even with fallback.");
			return null;
		}

		function basicMarkdownToHtml(text) {
			if (text === null || text === undefined) return '';
			let html = text;

			// 1. Escape basic HTML entities
			html = html.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;');

			// 2. Bold: **text** -> <strong>text</strong>
			html = html.replace(/\\*\\*?(.*?)\\*\\*?/g, '<strong>$1</strong>');

			// 3. Inline code: \`code\` -> <code>code</code>
			html = html.replace(/\`([^\`]+?)\`/g, '<code>$1</code>');
			
			// 4. Newlines to <br> for paragraph-like breaks
			html = html.replace(/\\n/g, '<br>');

			return html;
		}

		function processAndDisplayFinalResponse(fullResponse) {
			streamingResponseArea.style.display = 'none'; 
			finalResponseDisplay.style.display = 'block'; 

			finalAccumulatedResponseForLog = fullResponse; 
			extractedAISuggestedCode = extractImprovedCodeJS(fullResponse);

			const summaryRegex = /^.*?\\bSummary of Issues\\b.*(?:\\r?\\n)([\\s\\S]*?)(?=\\n.*?\\bImproved Code\\b|$)/im;
			const explanationRegex = /^.*\\bExplanation\\b.*(?:\\r?\\n)([\\s\\S]*)$/im;

			const summaryMatch = fullResponse.match(summaryRegex);
			const explanationMatch = fullResponse.match(explanationRegex); 

			const rawSummaryText = (summaryMatch && summaryMatch[1]) ? summaryMatch[1].trim() : 'Summary not found.';
			const rawExplanationText = (explanationMatch && explanationMatch[1]) ? explanationMatch[1].trim() : 'Explanation not found.';

			summaryContentRenderedEl.innerHTML = basicMarkdownToHtml(rawSummaryText);
			explanationContentRenderedEl.innerHTML = basicMarkdownToHtml(rawExplanationText);
			
			improvedCodeContentEl.textContent = extractedAISuggestedCode || 'Improved code not found.';
			
			if (extractedAISuggestedCode) { 
				acceptButton.disabled = false;
			}
			rejectButton.disabled = false;
		}

		window.addEventListener('message', event => {
			const message = event.data;
			switch (message.command) {
				case 'aiChunk':
					if (streamingResponseArea.classList.contains('loading-text')) {
						streamingResponseArea.textContent = ''; 
						streamingResponseArea.classList.remove('loading-text');
					}
					accumulatedRawResponse += message.chunk;
					streamingResponseArea.textContent = accumulatedRawResponse; 
					break;
				case 'aiStreamEnd':
					console.log('JS Webview: aiStreamEnd received. Full response length:', (message.fullResponse || accumulatedRawResponse).length);
					processAndDisplayFinalResponse(message.fullResponse || accumulatedRawResponse);
					break;
				case 'aiError':
					streamingResponseArea.textContent = 'Error: ' + message.error;
					streamingResponseArea.classList.remove('loading-text');
					streamingResponseArea.style.color = 'red';
					rejectButton.disabled = false;
					break;
			}
		});
		
		acceptButton.addEventListener('click', () => {
			if (extractedAISuggestedCode === null) {
				alert('Error: No improved code available to apply.'); 
				return;
			}
			vscode.postMessage({
				command: 'accept',
				fileName: jsCurrentFileName,
				improvedCode: extractedAISuggestedCode, 
				selection: jsCurrentSelection, 
				documentUri: jsCurrentDocumentUri
			});
		});

		rejectButton.addEventListener('click', () => {
			vscode.postMessage({
				command: 'reject',
				fileName: jsCurrentFileName,
				originalCode: jsOriginalSelectedCode,    
				aiSuggestedCode: extractedAISuggestedCode, 
				aiFullResponse: finalAccumulatedResponseForLog, 
				selection: jsCurrentSelection,
				documentUri: jsCurrentDocumentUri
			});
		});
	
	`;
}


