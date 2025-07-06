import * as vscode from 'vscode';
import {clearUserPreferences, setUserPreferences, showUserPreferences} from '../utils/ai';

export function registerSetAIPreferences(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.setAIPreferences', () =>
        setUserPreferences(context)
    );
}

export function registerShowAIPreferences(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.showAIPreferences', () =>
        showUserPreferences(context)
    );
}

export function registerClearAIPreferences(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.clearAIPreferences', () =>
        clearUserPreferences(context)
    );
}