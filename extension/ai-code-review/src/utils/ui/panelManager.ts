import * as vscode from 'vscode';

let panelInstance: vscode.WebviewPanel | undefined;

export function getPanel(): vscode.WebviewPanel | undefined {
    return panelInstance;
}

export function setPanel(panel: vscode.WebviewPanel | undefined): void {
    panelInstance = panel;
}
