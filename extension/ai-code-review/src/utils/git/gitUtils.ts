import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';

function getWorkspaceFolder(): string | null {
	const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (!folder) {
		vscode.window.showErrorMessage('No workspace folder found.');
		return null;
	}
	return folder;
}

export function getGitClient(): SimpleGit | null {
	const folder = getWorkspaceFolder();
	return folder ? simpleGit({ baseDir: folder }) : null;
}
