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

function highlightDiffFSharp(diffText) {
    const hasHljs = typeof hljs !== 'undefined';
    return diffText.split('\n').map(line => {
        const prefix = line[0] || ' ';
        const content = line.slice(1);
        let className = '';
        // eslint-disable-next-line curly
        if (prefix === '+') className = 'hljs-addition';
        // eslint-disable-next-line curly
        else if (prefix === '-') className = 'hljs-deletion';

        let innerHtml;
        if (hasHljs && hljs.getLanguage('fsharp')) {
            innerHtml = hljs.highlight(content, { language: 'fsharp' }).value;
        } else {
            innerHtml = content.replace(/&/g, '&amp;')
                               .replace(/</g, '&lt;')
                               .replace(/>/g, '&gt;');
        }

        return `<span class="${className}">${prefix}${innerHtml}</span>`;
    }).join('\n');
}

function generateDiffHtml(originalCode, improvedCode) {
    const normalizedOriginal = (originalCode || '').replace(/\r\n/g, '\n');
    const normalizedAISuggestion = (improvedCode || '').replace(/\r\n/g, '\n');

    const canShowDiff = typeof Diff !== 'undefined' && Diff.diffLines;

    if (!canShowDiff) {
        return;
    }

    const diff = Diff.diffLines(normalizedOriginal, normalizedAISuggestion);
    console.log('generateDiffHtml diff:', diff);
    const diffText = diff.map(part => {
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';

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

        return lines.map(line => prefix + line).join('\n');
    }).join('\n');

    console.log('generateDiffHtml diffText:', diffText);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-diff-fsharp hljs';
    code.dataset.highlighted = 'yes';
    code.innerHTML = highlightDiffFSharp(diffText);
    pre.appendChild(code);
    return pre;
}

function buildMessagePayload(command) {
    return {
        command,
        aiSuggestedCode: extractedAISuggestedCode,
        selection: jsCurrentSelection,
        documentUri: jsCurrentDocumentUri
    };
}

console.log('hljs loaded:', typeof hljs !== 'undefined');

marked.setOptions({
    highlight: function (code, lang) {
        console.log('highlight lang:', lang);
        if (lang && lang.toLowerCase() === 'diff:fsharp') {
            return highlightDiffFSharp(code);
        }
        const validLang = (lang && hljs.getLanguage(lang)) ? lang : 'plaintext';
        return hljs.highlight(code, { language: validLang }).value;
    }
});

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
            
            const html = marked.parse(accumulatedRawResponse);
            streamingResponseArea.innerHTML = html;

            hljs.highlightAll();

            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 0);            

            break;
        case 'aiStreamEnd':
            extractedAISuggestedCode = extractImprovedCodeJS(message.fullResponse || accumulatedRawResponse);

            const improvedCodeElement = streamingResponseArea.querySelector('pre code.language-fsharp');
            const improvedCode = extractedAISuggestedCode || '';

            // Build and insert our diff:fsharp block
            const diffBlock = generateDiffHtml(jsOriginalWholeFileContent || '', improvedCode);
            if (improvedCodeElement && improvedCodeElement.parentElement) {
                improvedCodeElement.parentElement.insertAdjacentElement('afterend', diffBlock);
                improvedCodeElement.parentElement.remove();
            }

            // eslint-disable-next-line curly
            if (extractedAISuggestedCode) acceptButton.disabled = false;
            rejectButton.disabled = false;
            renderPreferenceSection();
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