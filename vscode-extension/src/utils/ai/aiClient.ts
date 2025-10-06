import * as vscode from 'vscode';
import { getCurrentApi, getCurrentModel } from './modelManager';

let activeAbort: AbortController | null = null;
let abortReason: 'user' | 'timeout' | null = null;

export class UserAbort extends Error {
	constructor() { super('User aborted'); this.name = 'UserAbort'; }
}

export function abortActiveRequest() {
	if (activeAbort) {
		abortReason = 'user';
		try { activeAbort.abort(); } catch {}
	}
}

export async function* queryAIStream(
	suggestionPanel: vscode.WebviewPanel,
    prompt: string,
    context: vscode.ExtensionContext
) {
	try {
		const controller = new AbortController();

		// cancel any previous active stream
		abortActiveRequest();
		activeAbort = controller;
		abortReason = null;

		const timeout = setTimeout(() => {
			abortReason = 'timeout';
			controller.abort();
		}, 120_000); //120s

		const api = getCurrentApi(context);
        const model = getCurrentModel(context);

        const response = await fetch(api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt, stream: true }),
            signal: controller.signal
        });

		clearTimeout(timeout);

		if (!response.ok) {
			await handleAPIError(response);
			return;
		}

		if (!response.body) {
            vscode.window.showErrorMessage('AI response body is null.');
            return;
        }

		yield* streamResponseChunks(response.body);
		activeAbort = null;
		abortReason = null;
	} catch (error: any) {
        handleStreamError(suggestionPanel, error);
    }
}

async function handleAPIError(response: Response) {
	const errorBody = await response.text();
	console.error(`AI API Error: ${response.status} ${response.statusText}`, errorBody);
	vscode.window.showErrorMessage('AI Server Error');
}

function handleStreamError(suggestionPanel: vscode.WebviewPanel, error: any) {
	if (error.name === 'AbortError') {
		if (abortReason === 'user') {
			// tell the webview and throw a recognizable error that the caller can ignore
			suggestionPanel.webview.postMessage({ command: 'aiStopped' });
			vscode.window.setStatusBarMessage('Stopped AI stream', 3000);
			activeAbort = null; 
			abortReason = null;
			throw new UserAbort();
		} else {
			// timeout
			vscode.window.showErrorMessage('AI request timed out.');
			suggestionPanel.webview.postMessage({ command: 'aiError', error: 'AI request timed out.' });
			activeAbort = null; abortReason = null;
		}
	} else if (error instanceof TypeError && error.message.includes('fetch failed')) {
		console.error('Failed to connect to the AI server. Is the Ollama server running?');
		vscode.window.showErrorMessage('Failed to connect to AI. Make sure Ollama is running.', {modal: true});
		suggestionPanel.webview.postMessage({
			command: 'aiError',
			error: 'Failed to connect to AI',
		});
	}
	else {
		console.error('Failed to query AI:', error);
		suggestionPanel.webview.postMessage({
			command: 'aiError',
			error: 'Failed to query AI',
		});
	}
	throw error;
}

async function* streamResponseChunks(body: ReadableStream<Uint8Array>) {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			yield* flushRemainingBuffer(buffer);
			break;
		}

		buffer += decoder.decode(value, { stream: true });

		let newlineIndex;
		while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
			const line = buffer.slice(0, newlineIndex).trim();
			buffer = buffer.slice(newlineIndex + 1);

			if (!line) {continue;}

			try {
				const jsonLine = JSON.parse(line);
				if (jsonLine.response) {yield jsonLine.response;}
				if (jsonLine.done) {return;}
			} catch (err) {
				console.error('Error parsing stream line:', err, line);
			}
		}
	}
}

function* flushRemainingBuffer(buffer: string) {
	if (!buffer.trim()) {return;}

	try {
		const jsonLine = JSON.parse(buffer);
		if (jsonLine.response) {yield jsonLine.response;}
	} catch (e) {
		console.error('Error parsing final buffered JSON line:', e, buffer);
	}
}