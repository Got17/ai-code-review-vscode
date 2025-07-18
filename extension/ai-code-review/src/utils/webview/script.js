const vscode = acquireVsCodeApi();
let accumulatedRawResponse = '';
const streamingResponseArea = document.getElementById('streaming-response-area');
const finalResponseDisplay = document.getElementById('final-response-display');

const summaryContentRenderedEl = document.getElementById('summary-content');
const improvedCodeContentEl = document.getElementById('improved-code-content');
const explanationContentRenderedEl = document.getElementById('explanation-content');
const diffViewArea = document.getElementById('diff-view-area');
const improvedCodeDisplaySection = document.getElementById('improved-code-section');

const acceptButton = document.getElementById('accept-button');
const rejectButton = document.getElementById('reject-button');
const editPrefsButton =  document.getElementById('edit-preference-button');
const clearPrefsButton = document.getElementById('clear-preference-button');

let extractedAISuggestedCode = null; 
let finalAccumulatedResponseForLog = '';

let jsOriginalWholeFileContent = null;
let jsCurrentSelection = null;
let jsCurrentDocumentUri = null;

function extractImprovedCodeJS(aiFullResponse) {
    if (!aiFullResponse) {return null;}
    const improvedCodeRegex = /(?:[\s\S].*?)?```fsharp\n([\s\S]*?)\n(?:[\s\S].*?)?```/im;

    const match = aiFullResponse.match(improvedCodeRegex);
    if (match && match[1]) {
        return match[1].trim();
    }
    
    console.warn("Main regex failed in JS. Trying simpler fallback for Improved Code block.");
    const simplerCodeBlockRegex = /```fsharp\n([\s\S]*?)\n```/i;
    const simplerMatch = aiFullResponse.match(simplerCodeBlockRegex);
    if (simplerMatch && simplerMatch[1]) {
        return simplerMatch[1].trim();
    }
    console.error("JS: Could not find the 'Improved Code' F# block even with fallback.");
    return null;
}

function basicMarkdownToHtml(text) {
    if (text === null || text === undefined) {return '';}
    let html = text;

    // 1. Escape basic HTML entities
    html = html.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

    // 2. Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*?(.*?)\*\*?/g, '<strong>$1</strong>');

    // 3. Inline code: \`code\` -> <code>code</code>
    html = html.replace(/\`([^\`]+?)\`/g, '<code>$1</code>');
    
    // 4. Newlines to <br> for paragraph-like breaks
    html = html.replace(/\n/g, '<br>');

    return html;
}

function processAndDisplayFinalResponse(fullResponse) {
    streamingResponseArea.style.display = 'none'; 
    finalResponseDisplay.style.display = 'block'; 

    finalAccumulatedResponseForLog = fullResponse; 
    extractedAISuggestedCode = extractImprovedCodeJS(fullResponse);

    const canShowDiff = typeof Diff !== 'undefined' && Diff.diffLines && extractedAISuggestedCode !== null && jsOriginalWholeFileContent !== null;

    if (canShowDiff) {
        const normalizedOriginal = jsOriginalWholeFileContent.replace(/\r\n/g, '\n');
        const normalizedAISuggestion = extractedAISuggestedCode.replace(/\r\n/g, '\n');
    
        const changes = Diff.diffLines(normalizedOriginal, normalizedAISuggestion);

        const fragment = document.createDocumentFragment();

        changes.forEach((part) => {
            const partPre = document.createElement('pre');
            let prefix = '';
            if (part.added) {
                partPre.className = 'diff-added';
                prefix = '+ ';
            } else if (part.removed) {
                partPre.className = 'diff-removed';
                prefix = '- ';
            } else {
                partPre.className = 'diff-common';
                prefix = '  '; 
            }

            const lines = String(part.value).split('\n');
            if (lines.length > 0 && lines[lines.length - 1] === '') {
                lines.pop();
            }
            if (lines.length === 0 && part.value === '\n') { 
                lines.push(''); 
            }
            if (lines.length === 0 && !part.value) { 
                return;
            }
            lines.forEach(line => {
                const lineTextNode = document.createTextNode(prefix + line + '\n'); 
                partPre.appendChild(lineTextNode);
            });
            fragment.appendChild(partPre);
        });
        diffViewArea.innerHTML = ''; 
        diffViewArea.appendChild(fragment);
        improvedCodeDisplaySection.style.display = 'none';
    } else {
        console.warn("Diff library (jsdiff) not found, or original/AI code missing. Showing raw improved code.");
        improvedCodeContentEl.textContent = extractedAISuggestedCode || 'Improved code not found.';
        improvedCodeDisplaySection.style.display = 'block';
    }

    const summaryRegex = /(?:^|\n)#*\**\s*Summary of Issues\b.*?(?:\r?\n)+([\s\S]*?)(?=\n#*\**\s*(Improved Code|Explanation)|$)/i;
    const explanationRegex = /(?:^|\n)#*\**\s*Explanation\b.*?(?:\r?\n)+([\s\S]*?)(?=\n#*\**\s*\w+|$)/i;

    const summaryMatch = fullResponse.match(summaryRegex);
    const explanationMatch = fullResponse.match(explanationRegex); 

    const rawSummaryText = (summaryMatch && summaryMatch[1]) ? summaryMatch[1].trim() : 'Summary not found.';
    const rawExplanationText = (explanationMatch && explanationMatch[1]) ? explanationMatch[1].trim() : 'Explanation not found.';

    summaryContentRenderedEl.innerHTML = basicMarkdownToHtml(rawSummaryText);
    explanationContentRenderedEl.innerHTML = basicMarkdownToHtml(rawExplanationText);
    
    if (!canShowDiff) {
        improvedCodeContentEl.textContent = extractedAISuggestedCode || 'Improved code not found.';
    }
    if (extractedAISuggestedCode) { 
        acceptButton.disabled = false;
    }
    rejectButton.disabled = false;
}

function buildMessagePayload(command) {
    return {
        command,
        aiSuggestedCode: extractedAISuggestedCode,
        selection: jsCurrentSelection,
        documentUri: jsCurrentDocumentUri
    };
}

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'init':
			jsOriginalWholeFileContent = message.wholeFileContent;
			jsCurrentSelection = message.selection;
			jsCurrentDocumentUri = message.documentUri;
			break;
        case 'aiChunk':
            if (streamingResponseArea.classList.contains('loading-text')) {
                streamingResponseArea.textContent = ''; 
                streamingResponseArea.classList.remove('loading-text');
            }
            accumulatedRawResponse += message.chunk;
            streamingResponseArea.textContent = accumulatedRawResponse;
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 0);
            break;
        case 'aiStreamEnd':
            processAndDisplayFinalResponse(message.fullResponse || accumulatedRawResponse);
            break;
        case 'aiError':
            streamingResponseArea.textContent = 'Error: ' + message.error;
            streamingResponseArea.classList.remove('loading-text');
            streamingResponseArea.style.color = 'red';
            rejectButton.disabled = false;
            break;
        default:
            console.warn(`Unhandled command received in webview: ${message.command}`);
            break;
    }
});

// Handle Accept Button Click
acceptButton.addEventListener('click', () => {
    if (extractedAISuggestedCode === null) {
        alert('Error: No improved code available to apply.');
        return;
    }

    vscode.postMessage(buildMessagePayload('accept'));
});

// Handle Reject Button Click
rejectButton.addEventListener('click', () => {
    vscode.postMessage(buildMessagePayload('reject'));
});

// Handle Preference Button Click
editPrefsButton.addEventListener('click', () => {
    vscode.postMessage(buildMessagePayload('editPreferences'));
});

// Handle Clear Preference Button Click
clearPrefsButton.addEventListener('click', () => {
    vscode.postMessage(buildMessagePayload('clearPreferences'));
});