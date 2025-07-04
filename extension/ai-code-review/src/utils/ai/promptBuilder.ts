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
You are a code review assistant specialized in F# and WebSharper.
Improve ONLY the SELECTED CODE within the full file context.

DO NOT repeat past mistakes described in the rejection list — those were rejected by the user even when justified.
Follow accepted patterns where possible.

---

**INSTRUCTIONS:**
1. Improve the SELECTED CODE (clarity, performance, maintainability).
2. Only touch surrounding code if necessary.
3. Preserve formatting outside the selection.
4. Response must follow this format:
   - Summary of Issues (bullet list)
   - Improved Code (entire file inside \`\`\`fsharp)
   - Explanation (bullet list)

**Full File \`${fileLabel}\`:**
\`\`\`fsharp
${fullContent}
\`\`\`

**Selected Code \`${fileLabel}\`**:
${selectionContextInfo}
\`\`\`fsharp
${selectedSnippet}
\`\`\`
    `.trim();
}
