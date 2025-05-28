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
    if (!logDirPath) {
        console.error('[LogRejectionDebug] Log directory path is null. Aborting logRejection.');
        return; 
    }    

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

    try {
        let logs: RejectionLogEntry[] = [];
        if (fs.existsSync(logFilePath)) {
            const fileContent = fs.readFileSync(logFilePath, 'utf-8');
            
            if (fileContent.trim() === "") { 
                logs = [];
            } else {
                logs = JSON.parse(fileContent); 
            }
        }

        logs.push(newEntry);        

        const jsonString = JSON.stringify(logs, null, 2);
        
        fs.writeFileSync(logFilePath, jsonString, 'utf-8');        

        vscode.window.showInformationMessage('Suggestion rejected and logged.');

    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to write rejection log: ${error.message}`);
    }
}