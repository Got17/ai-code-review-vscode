import * as vscode from 'vscode';
import { getUserPreferences } from './preferencesManager';

export async function buildPrompt(
	selectedCode: string,
	wholeFileContent: string,
	fileName: string,
	selectionRange: vscode.Selection,
  	context: vscode.ExtensionContext
) {
	const fileLabel = fileName || 'current file';
	const selectionInfo = selectionRange
		? `The user has specifically selected lines ${selectionRange.start.line + 1}-${selectionRange.end.line + 1} for review.`
		: '';
	const userPreferences = await getUserPreferences(context);

	const preferencesBlock = `
---
USER PREFERENCES:
${userPreferences || 'No preferences set.'}
---
`;

	return generatePromptTemplate(fileLabel, wholeFileContent, selectedCode, selectionInfo, preferencesBlock);
}

function generatePromptTemplate(
	fileLabel: string,
	fullContent: string,
	selectedSnippet: string,
	selectionContextInfo: string,
	preferencesBlock: string
): string {
	return `
${preferencesBlock}
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

**FULL FILE CONTENT from \`${fileLabel}\`:**
\`\`\`fsharp
${fullContent}
\`\`\`

**USER'S SELECTED CODE (the primary focus for your improvement efforts) from \`${fileLabel}\`:**
${selectionContextInfo}
\`\`\`fsharp
${selectedSnippet}
\`\`\`
    `.trim();
}
