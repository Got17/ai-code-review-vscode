const vscode = acquireVsCodeApi();

// === DOM ELEMENTS ===
const streamingResponseArea = document.getElementById('streaming-response-area');

const acceptButton = document.getElementById('accept-button');
const rejectButton = document.getElementById('reject-button');

// === STATE ===
let accumulatedRawResponse = '';
let extractedAISuggestedCode = null;

let jsOriginalWholeFileContent = null;
let jsCurrentSelection = null;
let jsCurrentDocumentUri = null;
let jsUserPreferences = null;
let jsCurrentModel = null;

// === UTILS ===
function escapeHtml(content) {
    return content.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
}

function buildMessagePayload(command) {
    return {
        command,
        aiSuggestedCode: extractedAISuggestedCode,
        selection: jsCurrentSelection,
        documentUri: jsCurrentDocumentUri
    };
}

function scrollToBottom() {
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 0);
}

function createButton({ id, text, title, onClick }) {
    const btn = document.createElement("button");
    btn.id = id;
    btn.textContent = text;
    btn.title = title;
    btn.addEventListener('click', onClick);
    return btn;
}

// === CODE EXTRACTION & DIFF ===
function extractImprovedCode(aiResponse) {
    // eslint-disable-next-line curly
    if (!aiResponse) return null;

    const regex = /(?:[\s\S].*?)?```fsharp\n([\s\S]*?)\n(?:[\s\S].*?)?```/im;
    const fallback = /```fsharp\n([\s\S]*?)\n```/i;

    const match = aiResponse.match(regex) || aiResponse.match(fallback);
    return match?.[1]?.trim() ?? null;
}

function highlightDiffFSharp(diffText) {
    const hasHljs = typeof hljs !== 'undefined';

    return diffText.split('\n').map(line => {
        const prefix = line[0] || ' ';
        const content = line.slice(1);
        const className = prefix === '+' ? 'hljs-addition' : prefix === '-' ? 'hljs-deletion' : '';
        const innerHtml = hasHljs && hljs.getLanguage('fsharp')
            ? hljs.highlight(content, { language: 'fsharp' }).value
            : escapeHtml(content);

        return `<span class="${className}">${prefix}${innerHtml}</span>`;
    }).join('\n');
}

function generateDiffHtml(originalCode, improvedCode) {
    const o = (originalCode || '').replace(/\r\n/g, '\n');
    const i = (improvedCode || '').replace(/\r\n/g, '\n');

    // eslint-disable-next-line curly
    if (typeof Diff === 'undefined' || !Diff.diffLines) return;

    const diff = Diff.diffLines(o, i);
    const diffText = diff.map(part => {
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
        const lines = part.value.split('\n').filter((l, i, arr) => i !== arr.length - 1 || l !== '');
        return lines.map(line => prefix + line).join('\n');
    }).join('\n');

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'language-diff-fsharp hljs';
    code.dataset.highlighted = 'yes';
    code.innerHTML = highlightDiffFSharp(diffText);
    pre.appendChild(code);
    return pre;
}

// === RENDERING ===
function renderPreferenceSection() {
    const header = document.createElement("h3");
    header.textContent = "Active AI Preferences:";

    const detail = document.createElement("pre");
    detail.id = "user-preference";
    detail.textContent = `${jsUserPreferences}`;

    const modelLine = document.createElement("div");
    modelLine.style.margin = '8px 0';
    modelLine.textContent = `Model: ${jsCurrentModel}`;

    const editButton = createButton({
        id: "edit-preference-button",
        text: "✏️ Edit Preferences",
        title: "Edit AI Preferences",
        onClick: () => vscode.postMessage(buildMessagePayload('editPreferences'))
    });

    const clearButton = createButton({
        id: "clear-preference-button",
        text: "🧹 Clear Preferences",
        title: "Clear AI Preferences",
        onClick: () => vscode.postMessage(buildMessagePayload('clearPreferences'))
    });

    const changeModelBtn = createButton({
        id: "change-model-button",
        text: "🧠 Change Model",
        title: "Pick another Ollama model",
        onClick: () => vscode.postMessage(buildMessagePayload('changeModel'))
    });

    streamingResponseArea.append(header, detail, editButton, clearButton, changeModelBtn);
}

function renderMarkdownChunk(chunk) {
    streamingResponseArea.innerHTML = marked.parse(chunk);
    hljs.highlightAll();
    scrollToBottom();
}

// === MARKDOWN OPTIONS ===
console.log('hljs loaded:', typeof hljs !== 'undefined');

marked.setOptions({
    highlight: function (code, lang) {
        const isDiffFSharp = lang && lang.toLowerCase() === 'diff:fsharp';
        const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
        return isDiffFSharp ? highlightDiffFSharp(code) : hljs.highlight(code, { language: validLang }).value;
    }
});

// === EVENT LISTENER ===
window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
        case 'init':
            jsOriginalWholeFileContent = message.wholeFileContent;
            jsCurrentSelection = message.selection;
            jsCurrentDocumentUri = message.documentUri;
            jsUserPreferences = message.userPreferences;
            jsCurrentModel = message.currentModel || 'N/A';
            break;

        case 'aiChunk':
            accumulatedRawResponse += message.chunk;
            renderMarkdownChunk(accumulatedRawResponse);
            break;

        case 'aiStreamEnd':
            extractedAISuggestedCode = extractImprovedCode(message.fullResponse || accumulatedRawResponse);

            const improvedCode = extractedAISuggestedCode || '';
            const improvedCodeElement = streamingResponseArea.querySelector('pre code.language-fsharp');

            const diffBlock = generateDiffHtml(jsOriginalWholeFileContent, improvedCode);
            if (improvedCodeElement?.parentElement && diffBlock) {
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
    }
});

// === BUTTONS ===
acceptButton.addEventListener('click', () => {
    if (!extractedAISuggestedCode) {
        alert('Error: No improved code available to apply.');
        return;
    }
    vscode.postMessage(buildMessagePayload('accept'));
});

rejectButton.addEventListener('click', () => {
    vscode.postMessage(buildMessagePayload('reject'));
});