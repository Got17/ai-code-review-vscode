import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';

function getWorkspaceFolder(): string | null {
		const folder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		if (!folder) {
			vscode.window.showErrorMessage('No workspace folder found.');
			return null;
		}
		return folder;
	}

export function getGitClient(): SimpleGit | null {
		const folder = getWorkspaceFolder();
		return folder ? simpleGit({ baseDir: folder }) : null;
	}

export function getSelectedCode(): string | null {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return null;
		}
	
		const selected = editor.document.getText(editor.selection);
		if (!selected) {
			vscode.window.showWarningMessage('Please select some code before running the command.');
			return null;
		}
	
		return selected;
	}

export function buildPrompt(selectedCode: string, fileName?: string): string {
  	return `
You are an expert in **F#** and **WebSharper**.

Review the following code and suggest improvements in the areas of:

1. **Readability**: UI logic clarity, reactive flow structure.
2. **Performance**: Efficient reactive updates, avoiding redundant computation.
3. **Maintainability**: Modular components, clean event handling.

**Constraints**:
- ONLY respond using the three sections below.
- DO NOT include any introductory or explanatory text outside these sections.
- DO NOT rephrase the prompt or summarize the task.
- DO NOT say the code is "already good" unless doing so directly in the **Summary of Issues**.
- Always include valid **F#** in the code block if suggesting changes.

**Formatting (must be exact)**:

1. **Summary of Issues**:
2. **Improved Code**:
3. **Explanation**:

${fileName ? `This code is from the file: \`${fileName}\`.` : ""}

\`\`\`fsharp
${selectedCode}
\`\`\`
  	`.trim();
}

export async function queryDeepSeek(prompt: string): Promise<string | null> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

		const start = Date.now();

		const response = await fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: 'deepseek-coder:6.7b-instruct',
				prompt: prompt,
				stream: false
			}),
			signal: controller.signal
		});

		clearTimeout(timeout);

		if (!response.ok) {
			vscode.window.showErrorMessage(`AI request failed: ${response.statusText}`);
			return null;
		}

		const data = await response.json() as { response: string };
		return data.response;
	} catch (err: any) {
		vscode.window.showErrorMessage(`AI request error: ${err.message}`);
		return null;
	}
}
