import * as vscode from 'vscode';

const PREFERENCES_KEY = 'aiPreferences';

// SET
export async function setUserPreferences(context: vscode.ExtensionContext) {
    const existing = await getUserPreferences(context);

    const input = await vscode.window.showInputBox({
        prompt: 'Enter your AI coding preferences (e.g., no renames, functional style)',
        value: existing || ''
    });

    if (input !== undefined) {
        await context.globalState.update(PREFERENCES_KEY, input.trim());

        vscode.window.showInformationMessage("Preferences saved! Run 'Show Suggestion' again to use updated style.");
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