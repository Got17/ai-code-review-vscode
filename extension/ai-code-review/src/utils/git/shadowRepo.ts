import * as vscode from 'vscode';
import * as path from 'node:path';
import simpleGit, { SimpleGit } from 'simple-git';

type Shadow = {
    git: SimpleGit;
    gitDir: string;
    workTree: string;
    repoRoot: string;
    lastKey: string;
};

const AI_COMMIT_PREFIX = 'chore(ai): apply suggestion';

// --- utils ---
function convertToPosix(p: string) { 
    return p.replace(/\\/g, '/'); 
}

function getWorkspaceRootForUri(docUri: vscode.Uri): string {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(docUri);
    if (workspaceFolder?.uri?.fsPath) {
        return workspaceFolder.uri.fsPath;
    }

    // Fallback: first workspace folder
    const firstFolderUri = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (firstFolderUri) {
        return firstFolderUri;
    }

    throw new Error('No workspace folder found for this document.');
}

function slugWorkTree(fsPath: string): string {
    // Make a stable folder name for this worktree under globalStorage
    // Keep it simple + safe for Windows paths:
    return fsPath.replace(/[:\\\/]/g, '_').slice(-120);
}

async function ensureDir(fsPath: string) {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(fsPath));
}

// --- API ---
export async function openShadowRepoForDocument(
    context: vscode.ExtensionContext,
    docUri: vscode.Uri
): Promise<Shadow> {
    const workTree = getWorkspaceRootForUri(docUri);
    const slug = slugWorkTree(workTree);
    const repoRoot = path.join(context.globalStorageUri.fsPath, 'shadow', slug);
    const gitDir = path.join(repoRoot, '.git');
    const lastKey = `ai.shadow.lastCommit.${slug}`;

    await ensureDir(context.globalStorageUri.fsPath);
    await ensureDir(repoRoot);

    // Use a client whose CWD is the workTree; we will always pass --git-dir
    const git = simpleGit({ baseDir: workTree });

    // Probe repo; init if missing, set core.worktree to the workspace root
    try {
        await git.raw(['--git-dir', gitDir, 'rev-parse', '--git-dir']);
    } catch {
        await git.raw(['-C', repoRoot, 'init']);                             // non-bare
        await git.raw(['--git-dir', gitDir, 'config', 'user.name', 'AI Reviewer']);
        await git.raw(['--git-dir', gitDir, 'config', 'user.email', 'ai@example.local']);
        await git.raw(['--git-dir', gitDir, 'config', 'core.worktree', workTree]);
    }

    return { git, gitDir, workTree, repoRoot, lastKey };
}

export async function shadowCommitFiles(
    context: vscode.ExtensionContext,
    shadow: Shadow,
    absFiles: string[],
    aiExplanation: string,
): Promise<string> {
    const relativeFilePaths = absFiles.map(f => convertToPosix(path.relative(shadow.workTree, f)));

    // Safety: show a clear error if any path would be outside workTree
    for (const relativeFilePath of relativeFilePaths) {
        if (relativeFilePath.startsWith('..')) {
            throw new Error(`File is outside the workspace root tracked by shadow Git: ${relativeFilePath}`);
        }
    }

    await shadow.git.raw(['--git-dir', shadow.gitDir, '-C', shadow.workTree, 'add', '--', ...relativeFilePaths]);

    const commitMessage = `${AI_COMMIT_PREFIX} (${aiExplanation})`;
    await shadow.git.raw(['--git-dir', shadow.gitDir, '-C', shadow.workTree, 'commit', '-m', commitMessage]);

    const head = (await shadow.git.raw(['--git-dir', shadow.gitDir, 'rev-parse', 'HEAD'])).trim();
    await context.globalState.update(shadow.lastKey, head);
    return head;
}

export async function shadowRevertLast(
    context: vscode.ExtensionContext,
    docUri?: vscode.Uri  // optional: if given, we’ll use its workTree bucket
) {
    // Choose a shadow bucket based on doc or fall back to the first folder
    const workspaceRoot = docUri ? getWorkspaceRootForUri(docUri) :
        (vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '');

    if (!workspaceRoot) {
        throw new Error('No workspace to revert in.');
    }

    const shadowRepo = await openShadowRepoForDocument(context, vscode.Uri.file(path.join(workspaceRoot, '.__anchor__')));

    const last = context.globalState.get<string>(shadowRepo.lastKey);
    if (!last) {
        vscode.window.showWarningMessage('No AI commit to revert (shadow).');
        return;
    }
    await shadowRepo.git.raw(['--git-dir', shadowRepo.gitDir, '-C', shadowRepo.workTree, 'revert', '--no-edit', last]);
    await context.globalState.update(shadowRepo.lastKey, undefined);
    vscode.window.showInformationMessage(`Reverted AI commit ${last.slice(0,7)} (shadow).`);
}

export async function shadowIsTracked(
    shadow: Shadow,
    relPosixPath: string
): Promise<boolean> {
    try {
        await shadow.git.raw(['--git-dir', shadow.gitDir, '-C', shadow.workTree, 'ls-files', '--error-unmatch', '--', relPosixPath]);
        return true;
    } catch {
        return false;
    }
}

export async function shadowEnsureBaseline(
    shadow: Shadow,
    absPath: string
) {
    const rel = convertToPosix(path.relative(shadow.workTree, absPath));
    if (await shadowIsTracked(shadow, rel)) {
        return;
    }

    // Stage current on-disk content as baseline so future revert never deletes the file
    await shadow.git.raw(['--git-dir', shadow.gitDir, '-C', shadow.workTree, 'add', '--', rel]);
    await shadow.git.raw(['--git-dir', shadow.gitDir, '-C', shadow.workTree, 'commit', '-m', `chore(ai): baseline ${rel}`]);
}