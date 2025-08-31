import * as vscode from 'vscode';
import { getWorkspaceRootForUri, LAST_COMMIT_PREFIX_KEY, slugWorkTree } from '../utils/git';

async function deleteUri(uri: vscode.Uri) {
  await vscode.workspace.fs.delete(uri, { recursive: true, useTrash: true });
}

export function registerClearShadowHistory(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.clearShadowHistory', async () => {
        const pick = await vscode.window.showQuickPick(
        [
            { label: 'Clear current workspace shadow Git history', action: 'current' },
            { label: 'Clear ALL shadow Git histories', action: 'all' },
            { label: 'Cancel', action: 'cancel' },
        ],
        { placeHolder: "This only affects the extension's shadow repos (not your own Git)." }
        );
        if (!pick || pick.action === 'cancel') {
            return;
        }

        try {
            if (pick.action === 'current') {
                const editor = vscode.window.activeTextEditor;
                if (!editor) { 
                    vscode.window.showWarningMessage('No active editor.'); 
                    return; 
                }

                const activeUri = editor.document.uri;
                const workTree = getWorkspaceRootForUri(activeUri);
                if (!workTree) {
                    vscode.window.showWarningMessage('No workspace folder found.');
                    return;
                }

                const slug = slugWorkTree(workTree);
                const shadowDir = vscode.Uri.joinPath(context.globalStorageUri, 'shadow', slug);
                const lastKey = `${LAST_COMMIT_PREFIX_KEY}.${slug}`;

                const confirm = await vscode.window.showWarningMessage(
                    `Delete shadow history for this workspace?\n${shadowDir.fsPath}`,
                    { modal: true },
                    'Delete'
                );
                if (confirm !== 'Delete') {
                    return;
                }

                await deleteUri(shadowDir);
                await context.globalState.update(lastKey, undefined);
                vscode.window.showInformationMessage('Shadow history cleared for current workspace.');
            } else if (pick.action === 'all') {
                const root = vscode.Uri.joinPath(context.globalStorageUri, 'shadow');
                const confirm = await vscode.window.showWarningMessage(
                    `Delete ALL shadow histories?\n${root.fsPath}`,
                    { modal: true },
                    'Delete ALL'
                );
                if (confirm !== 'Delete ALL') {
                    return;
                }

                await deleteUri(root);
                await context.globalState.update('ai.shadow.lastCommit', undefined);
                vscode.window.showInformationMessage('All shadow histories cleared.');
            }
        } catch (e: any) {
            vscode.window.showErrorMessage(`Failed to clear shadow history: ${e?.message ?? e}`);
        }
    });
}
