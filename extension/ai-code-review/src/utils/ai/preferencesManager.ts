import * as vscode from 'vscode';

const PREFERENCES_KEY = 'aiPreferences';

// SET
export async function setUserPreferences(context: vscode.ExtensionContext, documentUri: string) {
    const existing = await getUserPreferences(context);

    const input = await vscode.window.showInputBox({
        prompt: 'Enter your AI coding preferences (e.g., no renames, functional style)',
        value: existing || ''
    });

    if (input !== undefined) {
        await context.globalState.update(PREFERENCES_KEY, input.trim());

        const action = await vscode.window.showInformationMessage(
            "Preferences saved! Do you want to run 'Show Suggestion' now?",
            'Yes',
            'No'
        );

        if (action === 'Yes') {
            if (documentUri) {
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(documentUri));
                await vscode.window.showTextDocument(doc, {
                    preserveFocus: false,
                    viewColumn: vscode.ViewColumn.One
                });
                vscode.commands.executeCommand('extension.showSuggestion');
            } else {
                vscode.window.showWarningMessage('No document URI found to reopen.');
            }
        }
    }
}

// GET
export async function getUserPreferences(context: vscode.ExtensionContext) {
    return (await context.globalState.get(PREFERENCES_KEY) as string || '');
}

// SHOW
export async function showUserPreferences(context: vscode.ExtensionContext) {
    const preferences = await getUserPreferences(context);
    vscode.window.showInformationMessage(
        preferences ? `Current AI Preferences:\n${preferences}` : 'No AI preferences set yet.'
    );
}

// CLEAR
export async function clearUserPreferences(context: vscode.ExtensionContext) {
  await context.globalState.update(PREFERENCES_KEY, '');
  vscode.window.showInformationMessage('AI preferences cleared.');
}