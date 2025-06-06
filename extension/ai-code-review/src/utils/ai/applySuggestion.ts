import * as vscode from 'vscode';

export async function applySuggestion(
    aiProvidedFullFileContent: string,
    originalSelectionForContext: vscode.Selection,
    documentUri: vscode.Uri
): Promise<void> {
    if (!documentUri) {
        vscode.window.showWarningMessage('Cannot apply suggestion: file context is missing.');
        return;
    }

    // Open the target document
    const doc = await vscode.workspace.openTextDocument(documentUri);

    // Show the document in an editor
    const editor = await vscode.window.showTextDocument(doc, {
        preserveFocus: false,
        viewColumn: vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One,
    });

    // Confirm the document matches the target
    if (editor.document.uri.toString() !== documentUri.toString()) {
        vscode.window.showErrorMessage('Error: The active editor does not match the document URI for applying changes.');
        return;
    }

    // Replace the entire document content
    const fullRange = new vscode.Range(
        doc.lineAt(0).range.start,
        doc.lineAt(doc.lineCount - 1).range.end
    );

    const success = await editor.edit(editBuilder => {
        editBuilder.replace(fullRange, aiProvidedFullFileContent);
    });

    if (!success) {
        vscode.window.showErrorMessage('Failed to apply suggestion (replacing whole file).');
        return;
    }

    // Restore original selection and focus
    editor.selection = originalSelectionForContext;
    editor.revealRange(originalSelectionForContext, vscode.TextEditorRevealType.InCenterIfOutsideViewport);

    vscode.window.showInformationMessage('AI suggestion applied (entire file updated).');
}