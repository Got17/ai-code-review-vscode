import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';

function getWorkspaceFolder(): string | null {
		const folder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		if (!folder) {
			vscode.window.showErrorMessage('❌ No workspace folder found.');
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
			vscode.window.showErrorMessage('⚠️ No active editor found.');
			return null;
		}
	
		const selected = editor.document.getText(editor.selection);
		if (!selected) {
			vscode.window.showWarningMessage('📄 Please select some code before running the command.');
			return null;
		}
	
		return selected;
	}

export function buildPrompt(selectedCode: string, fileName?: string): string {
	return `
You are an expert in F# and WebSharper.

Your task is to review the following code and provide constructive suggestions to improve:

- ✅ Readability (e.g., UI logic clarity, reactive flow structure)
- ⚡ Performance (e.g., efficient reactive updates, avoiding unnecessary recomputation)
- 🔧 Maintainability (e.g., modular component structure, clean event handling)

**Important Guidelines**:
- Do not replace \`Var\` with \`View.Const\` unless you're sure the value is meant to be constant.
- Always preserve interactivity in UI components using \`Doc.Input\`, \`Var\`, and \`View\` bindings.
- If reactivity is not needed, explain why it's safe to remove it.
- If the code is already well-written, say so. Only suggest meaningful changes, and include brief inline comments if helpful.

Respond in this structured format:

1. 🔍 **Summary of Issues**
2. ✨ **Improved Code** (inside \`\`\`fsharp blocks)
3. 🧠 **Explanation**

${fileName ? `This code is from the file: \`${fileName}\`.` : ""}

\`\`\`fsharp
${selectedCode}
\`\`\`
	`.trim();
}

export async function queryDeepSeek(prompt: string): Promise<string | null> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

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
			vscode.window.showErrorMessage(`❌ AI request failed: ${response.statusText}`);
			return null;
		}

		const data = await response.json() as { response: string };
		return data.response;
	} catch (err: any) {
		vscode.window.showErrorMessage(`❌ AI request error: ${err.message}`);
		return null;
	}
}
