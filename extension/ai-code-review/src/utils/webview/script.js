const vscode = acquireVsCodeApi();

// === DOM ELEMENTS ===
const streamingResponseArea = document.getElementById('streaming-response-area');

const acceptButton = document.getElementById('accept-button');
const rejectButton = document.getElementById('reject-button');
const stopButton = document.getElementById('stop-button');

const modelSelect = document.getElementById('model-select');

const jumpToLatestBtn = document.getElementById('jump-to-latest');


// === STATE ===
let accumulatedRawResponse = '';
let extractedAISuggestedCode = null;
let errorOccurred = false;

let jsOriginalWholeFileContent = null;
let jsCurrentSelection = null;
let jsCurrentDocumentUri = null;
let jsUserPreferences = null;
let jsCurrentModel = null;

let autoScrollEnabled = true;
const BOTTOM_THRESH_PX = 60;

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
    if (autoScrollEnabled) {
        setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 0);
    } else {
        // show the button if user scrolled up
        jumpToLatestBtn.style.display = 'block';
    }
}

function createButton({ id, text, title, onClick }) {
    const btn = document.createElement("button");
    btn.id = id;
    btn.textContent = text;
    btn.title = title;
    btn.addEventListener('click', onClick);
    return btn;
}

function populateModelOptions(current, models) {
    console.log('[jsScript] Generate Model options');
    // clear
    modelSelect.innerHTML = '';

    const uniqueModels = Array.from(new Set(models || []));
    // Put current (if not present) at top
    const list = uniqueModels.includes(current) ? uniqueModels : [current, ...uniqueModels];

    for (const model of list) {
        if (!model) {
            continue;
        }
        const optionElement = document.createElement('option');
        optionElement.value = model;
        optionElement.textContent = model;
        if (model === current) {
            optionElement.selected = true;
        }
        modelSelect.appendChild(optionElement);
    }

    // last option: open command flow
    const last = document.createElement('option');
    last.value = 'change-model';
    last.textContent = 'Change Model';
    modelSelect.appendChild(last);
}

function isAtBottom() {
    return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - BOTTOM_THRESH_PX);
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
    const card = document.createElement('section');
    card.className = 'prefs-card';

    const header = document.createElement('div');
    header.className = 'prefs-header';

    const title = document.createElement('div');
    title.className = 'prefs-title';
    title.textContent = 'Active AI Preferences';

    const actions = document.createElement('div');
    actions.className = 'prefs-actions';

    const editBtn = createButton({
        id: 'edit-preference-button',
        text: 'Edit',
        title: 'Edit AI Preferences',
        onClick: () => vscode.postMessage(buildMessagePayload('editPreferences'))
    });
    editBtn.className = 'btn-ghost';

    const clearBtn = createButton({
        id: 'clear-preference-button',
        text: 'Clear',
        title: 'Clear AI Preferences',
        onClick: () => vscode.postMessage(buildMessagePayload('clearPreferences'))
    });
    clearBtn.className = 'btn-ghost btn-danger';

    actions.append(editBtn, clearBtn);
    header.append(title, actions);

    const body = document.createElement('div');
    body.className = 'prefs-body';

    const pre = document.createElement('pre');
    pre.id = 'user-preference';
    pre.className = 'prefs-pre';
    const txt = (jsUserPreferences || '').trim();
    pre.textContent = txt || 'None set.';
    if (!txt) {
        pre.classList.add('prefs-empty');
    }

    const meta = document.createElement('div');
    meta.className = 'prefs-meta';
    meta.textContent = `Model: ${jsCurrentModel}`;

    body.append(pre, meta);
    card.append(header, body);

    streamingResponseArea.append(card);
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
            // populateModelOptions(jsCurrentModel || 'N/A', []);
            jsOriginalWholeFileContent = message.wholeFileContent;
            jsCurrentSelection = message.selection;
            jsCurrentDocumentUri = message.documentUri;
            jsUserPreferences = message.userPreferences;
            jsCurrentModel = message.currentModel || 'N/A';
            stopButton.disabled = false;
            vscode.postMessage(buildMessagePayload('requestModels'));
            break;

        case 'modelsList':
            console.log('[jsScript] modelsList activate');
            populateModelOptions(jsCurrentModel, message.models || []);
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
            stopButton.disabled = true;
            break;

        case 'aiError':
            errorOccurred = true;
            streamingResponseArea.textContent = 'Error: ' + message.error;
            streamingResponseArea.classList.remove('loading-text');
            streamingResponseArea.style.color = 'red';
            acceptButton.disabled = true;
            rejectButton.disabled = false;
            break;

        case 'aiStopped':
            // user aborted; keep what we have, show a small note
            const note = document.createElement('div');
            note.className = 'stopped-note';
            note.textContent = '⏹ Stopped by user.';
            streamingResponseArea.appendChild(note);
            stopButton.disabled = true;
            rejectButton.disabled = false;  // let user close the panel cleanly
            break;

        default:
            console.warn(`Unhandled command received in webview: ${message.command}`);
    }
});

window.addEventListener('scroll', () => {
    const atBottom = isAtBottom();
    autoScrollEnabled = atBottom;
    jumpToLatestBtn.style.display = atBottom ? 'none' : 'block';
});

// === BUTTONS ===
jumpToLatestBtn.addEventListener('click', () => {
    autoScrollEnabled = true;
    jumpToLatestBtn.style.display = 'none';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

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

stopButton.addEventListener('click', () => {
    stopButton.disabled = true; // prevent double-clicks
    vscode.postMessage(buildMessagePayload('stopStream'));
});

modelSelect.addEventListener('change', () => {
    console.log('[jsScript] modelSelect changed');
    const selectedModelValue = modelSelect.value;
    if (selectedModelValue === 'change-model') {
        vscode.postMessage(buildMessagePayload('changeModel'));
        // restore selected to current
        const current = jsCurrentModel || 'N/A';
        for (const option of modelSelect.options) {
            if (option.value === current) {
                option.selected = true;
            }
        }
        return;
    }
    // Set model directly
    jsCurrentModel = selectedModelValue;
    vscode.postMessage({ ...buildMessagePayload('setModelDirect'), model: selectedModelValue });
});
