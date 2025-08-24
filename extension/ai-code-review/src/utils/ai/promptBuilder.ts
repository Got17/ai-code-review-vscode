import * as vscode from 'vscode';
import { getUserPreferences } from './preferencesManager';
import { getRagContext } from './ragContext';

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

	const originalPrompt = generatePromptTemplate(fileLabel, wholeFileContent, selectedCode, selectionInfo, preferencesBlock);
	let finalPrompt = originalPrompt;

	try {
		const ragCtx = await getRagContext(context, originalPrompt, 5);
		console.log('[RAG] ctx length:', ragCtx?.length ?? 0);
		console.log('[RAG] ctx preview:', (ragCtx || '').slice(0, 160));

		if (ragCtx && ragCtx.trim().length > 0) {
		finalPrompt =
`You are an AI assistant for F# and WebSharper code review.
Use ONLY the context below where applicable.

RAG CONTEXT:
${ragCtx}

=== ORIGINAL TASK ===
${originalPrompt}`;
		}
	} catch (e) {
		console.warn('[RAG] disabled or failed:', e);
	}

  	return finalPrompt;

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

---
INSTRUCTIONS:
1. Focus ONLY on improving the SELECTED CODE (clarity, performance, maintainability).
2. Preserve all other code in the file unless absolutely necessary for correctness.
3. Do NOT reorder or reformat the rest of the file.
4. Avoid unnecessary renames unless the user's preferences ask for it.
5. If removing code, be sure it's entirely unused.
6. You MUST format your response as:
   - ### Summary of Issues (bullet list)
   - ### Improved Code (entire file)
   - ### Explanation (bullet list)

**Full File \`${fileLabel}\`:**
\`\`\`fsharp
${fullContent}
\`\`\`

**Selected Code \`${fileLabel}\`**:
${selectionContextInfo}
\`\`\`fsharp
${selectedSnippet}
\`\`\`

REMINDER: You must output the entire file content with ONLY the selected region changed.
    `.trim();
}
