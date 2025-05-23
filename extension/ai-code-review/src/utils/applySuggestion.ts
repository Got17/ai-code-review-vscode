import * as vscode from 'vscode';

export async function applySuggestion(
	improvedCode: string,
	selection?: vscode.Selection,
  	documentUri?: vscode.Uri
): Promise<void> {
	if (!selection || !documentUri) {
		vscode.window.showWarningMessage('⚠️ Cannot apply suggestion: selection or file context is missing.');
		return;
	}

	const doc = await vscode.workspace.openTextDocument(documentUri);
	const editor = await vscode.window.showTextDocument(doc, {
		preserveFocus: false,
		viewColumn: vscode.ViewColumn.One
	});

	editor.selection = selection;

	await new Promise(resolve => setTimeout(resolve, 50));

	const success = await editor.edit(editBuilder => {
		if (selection.isEmpty) {
			editBuilder.insert(selection.start, improvedCode);
		} else {
			editBuilder.replace(selection, improvedCode);
		}
	});

	if (!success) {
		vscode.window.showErrorMessage('❌ Failed to apply suggestion.');
		return;
	}

	if (selection.isEmpty) {
		vscode.window.showInformationMessage('⚠️ No code was selected — the AI suggestion was inserted at your cursor.');
	} else {
		vscode.window.showInformationMessage('✅ Suggestion applied to selected code.');
	}
}
