import * as vscode from 'vscode';
import * as path from 'node:path';
import simpleGit, { SimpleGit } from 'simple-git';
import { Uri } from 'vscode';

type Shadow = { 
    git: SimpleGit; 
    gitDir: string; 
    workTree: string 
};

export type CommitMessage = {
    subject: string; 
    body?: string
}

const LAST_AI_COMMIT_KEY = 'ai.shadow.lastCommit';
const AI_COMMIT_PREFIX   = 'chore(ai): apply suggestion';

function workspaceFolder(): string {
    const p = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!p) {
        throw new Error('No workspace folder found.');
    }
    return p;
}

async function ensureDir(uri: Uri) {
    await vscode.workspace.fs.createDirectory(uri);
}

/** Open (or init) a shadow repo:
 *  - GIT_DIR = <globalStorage>/shadow.git   (bare)
 *  - WORK_TREE = <workspace root>
 *  so we can add/commit without touching user's .git
 */
export async function openShadowRepo(context: vscode.ExtensionContext): Promise<Shadow> {
    const workTree = workspaceFolder();
    const gitDir   = path.join(context.globalStorageUri.fsPath, 'shadow.git');

    await ensureDir(context.globalStorageUri);

    const git = simpleGit({ baseDir: workTree });

    // Does shadow.git exist / initialized?
    try {
        await git.raw(['--git-dir', gitDir, '--work-tree', workTree, 'rev-parse', '--git-dir']);
    } catch {
        // Init bare repo + identity
        await git.raw(['--git-dir', gitDir, '--work-tree', workTree, 'init', '--bare']);
        await git.raw(['--git-dir', gitDir, '--work-tree', workTree, 'config', 'user.name', 'AI Reviewer']);
        await git.raw(['--git-dir', gitDir, '--work-tree', workTree, 'config', 'user.email', 'ai@example.local']);
    }
    return { git, gitDir, workTree };
}

/** Stage + commit only specific files; returns HEAD hash */
export async function shadowCommit(
    shadow: Shadow,
    files: string[],
    subject: string,
    body?: string,
    context?: vscode.ExtensionContext
): Promise<string> {
    const { git, gitDir, workTree } = shadow;

    // Stage file(s)
    await git.raw(['--git-dir', gitDir, '--work-tree', workTree, 'add', ...files]);

    const msg = body && body.trim()
        ? `${subject}\n\n${body.trim()}`
        : subject;

    await git.raw(['--git-dir', gitDir, '--work-tree', workTree, 'commit', '-m', msg]);

    const head = (await git.raw(['--git-dir', gitDir, '--work-tree', workTree, 'rev-parse', 'HEAD'])).trim();
    if (context) {
        await context.globalState.update(LAST_AI_COMMIT_KEY, head);
    }
    return head;
}

export async function shadowRevertLast(context: vscode.ExtensionContext) {
    const shadow = await openShadowRepo(context);
    const { git, gitDir, workTree } = shadow;

    const last = context.globalState.get<string>(LAST_AI_COMMIT_KEY);
    if (!last) {
        vscode.window.showWarningMessage('No AI commit to revert.');
        return;
    }
    await git.raw(['--git-dir', gitDir, '--work-tree', workTree, 'revert', '--no-edit', last]);
    await context.globalState.update(LAST_AI_COMMIT_KEY, undefined);
    vscode.window.showInformationMessage(`Reverted AI commit ${last.slice(0,7)} (shadow).`);
}

export function formatAiCommitMessage(
    subjectHint?: string, 
    bullets?: string[]
): CommitMessage {
    // Subject (<=50 chars, imperative). Keep it short & meaningful.
    const base    = subjectHint && subjectHint.trim().length > 0
        ? subjectHint.trim()
        : 'apply suggested changes';

    const subject = `${AI_COMMIT_PREFIX}: ${base}`.slice(0, 70);
    const body = Array.isArray(bullets) && bullets.length
        ? bullets.map(b => `- ${b}`).join('\n')
        : undefined;

    return { subject, body };
}
