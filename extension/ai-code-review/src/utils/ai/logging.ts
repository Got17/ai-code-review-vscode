import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FEEDBACK_LOG_FILE, LOG_DIR_NAME } from '../constants';

interface FeedbackLogEntry {
    timestamp: string;
    action: 'accepted' | 'rejected';
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

function ensureLogDirectoryExists(workspaceRoot: string): string | null {
    const logDirPath = path.join(workspaceRoot, LOG_DIR_NAME);    

    try {
        if (!fs.existsSync(logDirPath)) {            
            fs.mkdirSync(logDirPath, { recursive: true });            
        }
        return logDirPath;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create AI feedback log directory: ${error}`);
        return null;
    }
}

export function logFeedback(
    action: 'accepted' | 'rejected',
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
    if (!logDirPath) {
        console.error('[logFeedback] Log directory path is null. Aborting logRejection.');
        return; 
    }    

    const logFilePath = path.join(logDirPath, FEEDBACK_LOG_FILE);    

    const newEntry: FeedbackLogEntry = {
        timestamp: new Date().toISOString(),
        action,
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

    console.log(`[FeedbackLogged] Action: ${action}, File: ${fileName}`);

    try {
        let logs: FeedbackLogEntry[] = [];

        if (fs.existsSync(logFilePath)) {
            const fileContent = fs.readFileSync(logFilePath, 'utf-8');
            logs = fileContent.trim() ? JSON.parse(fileContent) : [];
        }

        logs.push(newEntry);        
        fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), 'utf-8');  
        
        if (action === 'accepted') {
            console.log('Suggestion accepted and logged for learning.');
        } else {
            vscode.window.showInformationMessage('Suggestion rejected and logged.');
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to write rejection log: ${error.message}`);
    }
}