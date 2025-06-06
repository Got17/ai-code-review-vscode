import * as vscode from 'vscode';
import { AI_API, AI_MODEL } from "../constants";

export async function* queryAIStream(prompt: string) {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 120_000); //120s

		const response = await fetch(AI_API, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
                model: AI_MODEL,
                prompt,
                stream: true
            }),
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

	} catch (error: any) {
        handleStreamError(error);
    }
}

async function handleAPIError(response: Response) {
	const errorBody = await response.text();
	console.error(`AI API Error: ${response.status} ${response.statusText}`, errorBody);
	vscode.window.showErrorMessage('AI Server Error');
}

function handleStreamError(error: any) {
	if (error.name === 'AbortError') {
		console.error('AI request timed out.');
		vscode.window.showErrorMessage('AI request timed out.');
	} else {
		console.error('Failed to query AI:', error);
		vscode.window.showErrorMessage('Failed to query AI');
	}
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