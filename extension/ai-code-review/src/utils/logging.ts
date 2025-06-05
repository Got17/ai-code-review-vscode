import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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

const logDirName = '.ai_feedback_log';
const feedbackLogFileName = 'feedback_log.json';

function ensureLogDirectoryExists(workspaceRoot: string): string | null {
    const logDirPath = path.join(workspaceRoot, logDirName);    

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

    const logFilePath = path.join(logDirPath, feedbackLogFileName);    

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
            
            if (fileContent.trim() === "") { 
                logs = [];
            } else {
                logs = JSON.parse(fileContent); 
            }
        }

        logs.push(newEntry);        

        const jsonString = JSON.stringify(logs, null, 2);
        
        fs.writeFileSync(logFilePath, jsonString, 'utf-8');        
        
        if (action === 'accepted') {
            console.log('Suggestion accepted and logged for learning.');
        } else {
            vscode.window.showInformationMessage('Suggestion rejected and logged.');
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to write rejection log: ${error.message}`);
    }
}