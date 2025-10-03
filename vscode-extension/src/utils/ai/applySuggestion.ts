import * as vscode from 'vscode';
import { ApplyMode } from '../constants';

export async function applySuggestion(
    aiProvidedContent: string,
    originalSelectionForContext: vscode.Selection,
    documentUri: vscode.Uri,
    applyMode: ApplyMode = ApplyMode.Full
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

    const targetRange =
        applyMode === ApplyMode.Selection
            ? new vscode.Range(originalSelectionForContext.start, originalSelectionForContext.end)
            : new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end);

    const success = await editor.edit(editBuilder => {
        editBuilder.replace(targetRange, aiProvidedContent);
    });

    if (!success) {
        vscode.window.showErrorMessage('Failed to apply suggestion.');
        return;
    }

    // Restore original selection and focus
    editor.selection = originalSelectionForContext;
    editor.revealRange(originalSelectionForContext, vscode.TextEditorRevealType.InCenterIfOutsideViewport);

    vscode.window.showInformationMessage(
        applyMode === 'selection'
            ? 'AI suggestion applied (selected region updated).'
            : 'AI suggestion applied (entire file updated).'
    );
}