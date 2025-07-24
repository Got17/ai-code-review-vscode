import * as vscode from 'vscode';
import { getPanel } from '../ui';

const PREFERENCES_KEY = 'aiPreferences';

// SET
export async function setUserPreferences(context: vscode.ExtensionContext, documentUri: string) {
    const existing = await getUserPreferences(context);

    const input = await vscode.window.showInputBox({
        prompt: 'Enter your AI coding preferences (e.g., no renames, functional style)',
        value: existing || ''
    });

    await handlePreferenceUpdateFlow('saved', input, context, documentUri);
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
export async function clearUserPreferences(context: vscode.ExtensionContext, documentUri: string) {
    await context.globalState.update(PREFERENCES_KEY, '');

    await handlePreferenceUpdateFlow('cleared', 'None set.', context, documentUri);
}

async function handlePreferenceUpdateFlow(
    actionMessage: string, 
    input: string | undefined, 
    context: vscode.ExtensionContext, 
    documentUri: string
) {
    if (input === undefined) {
        return;
    }

    await context.globalState.update(PREFERENCES_KEY, input.trim());
    await promptAndRunShowSuggestionCommand(actionMessage, documentUri);
}

async function promptAndRunShowSuggestionCommand(actionMessage: string, documentUri: string) {
    const userConfirmed = await showConfirmationPrompt(
        `Preferences ${actionMessage}! Do you want to run 'Show Suggestion' command?`
    );

    if (!userConfirmed) {
        return;
    }

    if (!documentUri) {
        vscode.window.showWarningMessage('No document URI found to reopen.');
        return;
    }

    const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(documentUri));
    await vscode.window.showTextDocument(doc, {
        preserveFocus: false,
        viewColumn: vscode.ViewColumn.One
    });

    await vscode.commands.executeCommand('extension.showSuggestion');
}

async function showConfirmationPrompt(message: string, yesLabel = 'Yes', noLabel = 'No'): Promise<boolean> {
    const choice = await vscode.window.showInformationMessage(message, yesLabel, noLabel);
    return choice === yesLabel;
}