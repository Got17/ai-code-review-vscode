import * as vscode from 'vscode';
import { getUserPreferences } from './preferencesManager';
import { ApplyMode, BIG_FILE_LINE_THRESHOLD } from '../constants';

export type BuiltPrompt = {
	prompt: string;
	applyMode: ApplyMode;
};
 
const CONTEXT_WINDOW_LINES = 200;        // lines before/after selection

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
`;

	const allLines = wholeFileContent.split(/\r?\n/);
	const isBig = allLines.length >= BIG_FILE_LINE_THRESHOLD;

	let applyMode: ApplyMode = ApplyMode.Full;
	let fullContextForPrompt = wholeFileContent;

	if (isBig && selectionRange) {
		// Build a light context window around the selection + header directives
		applyMode = ApplyMode.Selection;

		const start = Math.max(0, selectionRange.start.line - CONTEXT_WINDOW_LINES);
		const end = Math.min(allLines.length, selectionRange.end.line + CONTEXT_WINDOW_LINES);

		const header = allLines
			.slice(0, Math.min(200, allLines.length))
			.filter(line => /^\s*(namespace|module|open)\b/.test(line))
			.join('\n');

		const surroundingCode = allLines.slice(start, end).join('\n');

		fullContextForPrompt = `${header}\n...\n${surroundingCode}\n...`;
	}

	const baseTemplate = generatePromptTemplate(
		fileLabel,
		fullContextForPrompt,
		selectedCode,
		selectionInfo,
		preferencesBlock,
		applyMode
	);

	let finalPrompt = baseTemplate;
	const useRag = vscode.workspace.getConfiguration().get<boolean>('wsCodeReview.rag.enable', false);

	if (useRag) {
		try {
			const { getRagContext } = await import('./ragContext.js'); // lazy import
			const ragCtx = await getRagContext(context, selectedCode, 5);

			if (ragCtx && ragCtx.trim().length > 0) {
			finalPrompt =
`RAG CONTEXT:
${ragCtx}

=== ORIGINAL TASK ===
${baseTemplate}`;
			}
		} catch (error) {
			console.warn('[RAG] skipped:', error);
		}
	}

  	return { prompt: finalPrompt, applyMode };
}

function generatePromptTemplate(
	fileLabel: string,
	fullContextOrWindow: string,
	selectedSnippet: string,
	selectionContextInfo: string,
	preferencesBlock: string,
	applyMode: ApplyMode
): string {
	const outputSpec = applyMode === ApplyMode.Full
		? `- ### Improved Code (entire file)`
		: `- ### Improved Code (only the SELECTED region)`;

	const reminder = applyMode === ApplyMode.Full
		? `REMINDER: You must output the entire file content with ONLY the selected region changed.`
		: `REMINDER: Output ONLY the selected region's new code. Do not include any other file content.`;
 
	return `You are a code review assistant specialized in F# and WebSharper.
Improve ONLY the SELECTED CODE using the provided context.
${preferencesBlock}
---
INSTRUCTIONS:
1. Focus ONLY on improving the SELECTED CODE (clarity, performance, maintainability).
2. Preserve other code in the file; do not change it unless strictly required for correctness.
3. Avoid unnecessary renames unless the user's preferences ask for it.
4. If removing code, ensure it's entirely unused.
5. Indentation must stay EXACTLY the same as in the original selection.
6. You MUST format your response as:
   - ### Summary of Issues (bullet list)
   ${outputSpec}
   - ### Explanation (bullet list)

**File Context Window \`${fileLabel}\`:**
\`\`\`fsharp
${fullContextOrWindow}
\`\`\`

**Selected Code \`${fileLabel}\`**:
${selectionContextInfo}
\`\`\`fsharp
${selectedSnippet}
\`\`\`

${reminder}
`.trim();
}
