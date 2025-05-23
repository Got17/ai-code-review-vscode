import fs from 'fs';

export function logRejection(
    response: string, 
    fileName: string | undefined, 
    improvedCode: string | undefined
) {
    const timestamp = getTimestamp();
    const summary = extractSummary(response);

    const jsonData = {
        "timestamp": timestamp,
        "file": fileName,
        "codeSnippets": improvedCode,
        "summary": summary
    };

    let jsonDataString = JSON.stringify(jsonData);

    fs.writeFile("rejection-log.json", jsonDataString, (err) => {
        if (err) {
            throw err;
        }
        console.log('File written!');
    });
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