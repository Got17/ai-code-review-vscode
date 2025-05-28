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

export function buildPrompt(
    selectedCode: string,
    wholeFileContent: string,
    fileName?: string,
    selectionRange?: vscode.Selection
): string {
    let selectionContextInfo = "";
    if (selectionRange) {
        selectionContextInfo = `The user has specifically selected lines ${selectionRange.start.line + 1}-${selectionRange.end.line + 1} for review.`;
    }

    return `
You are an expert F# and WebSharper refactoring tool.
Your task is to review and improve a specific SELECTION of F# code within the context of an entire FILE.
The user wants to optimize the SELECTED CODE. To do this, you may need to modify other parts of the FILE (e.g., related functions, types, or module structure) IF AND ONLY IF those changes are ABSOLUTELY NECESSARY to best improve the selected code.

**RULES FOR RESPONSE (Strictly Follow):**
1.  **Focus of Improvement**: The primary goal is to improve the logic/readability/performance/maintainability of the code corresponding to the user's SELECTION.
2.  **Scope of Changes**:
    * While focusing on the selection, you ARE ALLOWED to modify other parts of the file ONLY IF it's a necessary consequence of optimally refactoring the selected code (e.g., changing a called function, adjusting a type definition used by the selection).
    * **MINIMIZE UNNECESSARY CHANGES**: Do not make stylistic changes to parts of the file that are unrelated to your refactoring of the selected code.
    * **DO NOT DELETE UNRELATED CODE (CRITICAL RULE)**: Do NOT remove any existing code (variables, functions, types, comments, module-level bindings like 'let People = ...', etc.) from the file that is NOT part of the \`USER'S SELECTED CODE\` itself or directly and necessarily impacted by the refactoring of the \`USER'S SELECTED CODE\`. For example, if the selected code is a type definition and your suggestion is to remove it because it's unused by the selection or makes the selection obsolete, that is acceptable. However, do NOT remove other, unrelated variable definitions or functions from elsewhere in the file, even if you perceive them as unused in the broader file context unless that specific item was part of the selection being reviewed. The AI should assume all unselected code is intended to be kept unless its modification is a direct, unavoidable consequence of improving the selected code.
3.  **"Improved Code" Output**: The "2. Improved Code:" section of your response MUST contain the **ENTIRE, complete F# file content**, with all necessary modifications integrated. It should not just be the changed snippet.
4.  **Code Style and Formatting Preservation (VERY IMPORTANT for unrelated code):**
    * **Preserve Existing \`open\` Statements**: Do NOT unnecessarily change how types are qualified. If the original code uses \`open SomeModule;\` and then \`TypeFromModule\`, maintain this. Do NOT change it to \`SomeModule.TypeFromModule\` unless the \`open\` statement itself is part of the refactoring.
    * **Maintain Original Formatting for Unchanged Code**: For parts of the file that you are not actively refactoring, preserve the original line breaks, indentation, and general code style as closely as possible.
    * **Only Modify What's Necessary**: If a function or type outside the selection is modified, ensure the modification is minimal and directly supports the improvement of the selected code.
5.  **Response Structure**: Respond ONLY with the three sections: "1. Summary of Issues:", "2. Improved Code:", "3. Explanation:".
    * "1. Summary of Issues": Describe issues found, primarily in the selected code.
    * "2. Improved Code:": Provide the complete, modified F# file content within a single \`\`\`fsharp ... \`\`\` block.
    * "3. Explanation:": Explain the changes made, especially how they improve the selected code and why any related changes outside the selection were necessary. Clearly state if you had to modify code outside the user's selection and why. If you suggest removing the selected code, explain why.

**FULL FILE CONTENT from \`${fileName || 'current file'}\`:**
\`\`\`fsharp
${wholeFileContent}
\`\`\`

**USER'S SELECTED CODE (the primary focus for your improvement efforts) from \`${fileName || 'current file'}\`:**
${selectionContextInfo}
\`\`\`fsharp
${selectedCode}
\`\`\`
    `.trim();
}

export async function queryDeepSeek(prompt: string): Promise<string | null> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 180000); // 180s timeout
		const aiModel = "qwen2.5-coder:7b-instruct";

		const response = await fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: aiModel,
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
