import * as vscode from 'vscode';
import * as path from 'node:path';
import { openShadowRepoForDocument } from '../utils/git/shadowRepo';

function relPosix(from: string, abs: string) {
  return path.relative(from, abs).split(path.sep).join('/');
}

export function registerShowShadowHistory(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.showShadowHistory', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { 
            vscode.window.showWarningMessage('No active editor.'); 
            return; 
        }

        const docUri = editor.document.uri;

        try {
            // Open shadow repo bucket for this document’s workspace
            const shadow = await openShadowRepoForDocument(context, docUri);
            const relativePath = relPosix(shadow.workTree, docUri.fsPath);

            // Get concise log (follow renames, per-file)
            const log = await shadow.git.raw([
                '--git-dir', shadow.gitDir, '-C', shadow.workTree,
                'log', '--follow', '--oneline', '--decorate', '--', relativePath,
            ]);

            const lines = log.split(/\r?\n/).filter(Boolean);
            if (!lines.length) { 
                vscode.window.showInformationMessage('No shadow commits for this file yet.'); 
                return; 
            }

            const pick = await vscode.window.showQuickPick(
                lines.map(line => ({ label: line, description: relativePath })),
                { placeHolder: 'Select a commit to view details' }
            );
            if (!pick) {
                return;
            }

            const commit = pick.label.split(' ')[0]; // first token is hash
            const detail = await shadow.git.raw([
                '--git-dir', shadow.gitDir, '-C', shadow.workTree,
                'show', '--patch', '--stat', '-U3', commit, '--', relativePath,
            ]);

            // Open in an editor tab (language: diff)
            const doc = await vscode.workspace.openTextDocument({
                content: detail,
                language: 'diff',
            });
            await vscode.window.showTextDocument(doc, {
                preview: true,
                viewColumn: vscode.ViewColumn.Beside,
            });
        } catch (e: any) {
            vscode.window.showErrorMessage(`Shadow history error: ${e?.message ?? e}`);
        }
    });
}
