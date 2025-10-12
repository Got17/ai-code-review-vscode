import * as vscode from 'vscode';
import { CMD_SHOW_SUGGESTION } from '../constants';

// Ask user if they want to run the "Show Suggestion" command
export async function promptAndShowSuggestion(documentUri: string) {
    const go = await vscode.window.showInformationMessage(
        'Run "Show Suggestion" now with the new model?',
        'Yes',
        'No'
    );

    if (go !== 'Yes') {
        return;
    }

    const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(documentUri));
    await vscode.window.showTextDocument(doc, {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.One,
    });

    await vscode.commands.executeCommand(CMD_SHOW_SUGGESTION);
}
