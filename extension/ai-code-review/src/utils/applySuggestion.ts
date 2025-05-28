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

    const doc = await vscode.workspace.openTextDocument(documentUri);
    const editor = await vscode.window.showTextDocument(doc, {
        preserveFocus: false,
        viewColumn: vscode.window.activeTextEditor?.viewColumn || vscode.ViewColumn.One,
    });

    if (editor.document.uri.toString() !== documentUri.toString()) {
        vscode.window.showErrorMessage('Error: The active editor does not match the document URI for applying changes.');
        return;
    }

    const firstLine = doc.lineAt(0);
    const lastLine = doc.lineAt(doc.lineCount - 1);
    const entireDocumentRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

    const success = await editor.edit(editBuilder => {
        editBuilder.replace(entireDocumentRange, aiProvidedFullFileContent);
    });

    if (!success) {
        vscode.window.showErrorMessage('Failed to apply suggestion (replacing whole file).');
        return;
    }

    editor.selection = originalSelectionForContext;
    editor.revealRange(originalSelectionForContext, vscode.TextEditorRevealType.InCenterIfOutsideViewport);

    vscode.window.showInformationMessage('AI suggestion applied (entire file updated).');
}