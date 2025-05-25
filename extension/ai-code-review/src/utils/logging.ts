/* eslint-disable curly */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface RejectionLogEntry {
    timestamp: string;
    fileName: string | undefined;
    originalCode: string;
    aiSuggestedCode: string; 
    aiFullResponse: string;  
    selection: { 
        startLine: number;
        startChar: number;
        endLine: number;
        endChar: number;
    } | undefined;
}

const LOG_DIR_NAME = '.ai_feedback_log';
const REJECTIONS_FILE_NAME = 'rejections_log.json';

function ensureLogDirectoryExists(workspaceRoot: string): string | null {
    const logDirPath = path.join(workspaceRoot, LOG_DIR_NAME);
    try {
        if (!fs.existsSync(logDirPath)) {
            fs.mkdirSync(logDirPath, { recursive: true });
        }
        return logDirPath;
    } catch (error) {
        console.error('Failed to create log directory:', error);
        vscode.window.showErrorMessage(`Failed to create AI feedback log directory: ${error}`);
        return null;
    }
}

export function logRejection(
    fileName: string | undefined,
    originalCode: string,
    aiSuggestedCode: string,
    aiFullResponse: string,  
    selectionDetails?: vscode.Selection
) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('Cannot log rejection: No workspace folder open.');
        return;
    }
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const logDirPath = ensureLogDirectoryExists(workspaceRoot);
    if (!logDirPath) return;

    const logFilePath = path.join(logDirPath, REJECTIONS_FILE_NAME);

    const newEntry: RejectionLogEntry = {
        timestamp: new Date().toISOString(),
        fileName,
        originalCode,
        aiSuggestedCode,
        aiFullResponse,
        selection: selectionDetails ? {
            startLine: selectionDetails.start.line,
            startChar: selectionDetails.start.character,
            endLine: selectionDetails.end.line,
            endChar: selectionDetails.end.character
        } : undefined
    };

    console.log(`[REJECTED] Logging to ${logFilePath}`);
    console.log(`           File: ${fileName}`);
    console.log(`           Original: ${originalCode.substring(0, 50)}...`);
    console.log(`           Suggested: ${aiSuggestedCode.substring(0, 50)}...`);

    try {
        let logs: RejectionLogEntry[] = [];
        if (fs.existsSync(logFilePath)) {
            const fileContent = fs.readFileSync(logFilePath, 'utf-8');
            logs = JSON.parse(fileContent);
        }
        logs.push(newEntry);
        fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), 'utf-8');
        vscode.window.showInformationMessage('❌ Suggestion rejected and logged.');

    } catch (error) {
        console.error('Failed to write rejection log:', error);
        vscode.window.showErrorMessage(`Failed to write rejection log: ${error}`);
    }
}

function getTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function extractSummary(response: string): string {
    
    const summaryText = response.match(/\*\*Summary of Issues\*\*:\s*([\s\S]*?)\n\s*\*\*/i);

    if (!summaryText) {
        return 'Could not find "Summary" block';
    }

    return summaryText[1].trim();
}