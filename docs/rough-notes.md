# AI Code Review Extension – Rough Notes

This document summarizes the development progress of the AI Code Review VS Code Extension for F# + WebSharper, built as part of a thesis project. The development spanned from April to July 2025.

---

## Phase 1: Project Bootstrapping (April)

**Highlights:**
- Initialized Git repo with `.gitignore`, `README.md`, `mvp.md`, and `roadmap.md`
- Created a basic VS Code extension with code selection, info message, and Accept/Reject buttons
- Integrated Git: Accept = commit, Reject = stage only

**Commits:**
- 2025-04-09: Initial commit
- 2025-04-17: Add basic VS Code logic (selection, Git)
- 2025-04-17: Refactor Git helper functions

---

## Phase 2: AI Review Functionality (May)

**Highlights:**
- Implemented `buildPrompt` and `queryDeepSeek` for initial AI interaction
- Output displayed via Output Panel and Markdown file
- Started organizing commands into files (`aiReview`, `checkGitStatus`, etc.)

**Challenges:**
- Getting Ollama server to run reliably
- Prompt formatting took several tries to get usable responses

**Commits:**
- 2025-05-11: First working AI call with prompt + response
- 2025-05-15: Organized extension commands and added WebSharper docs

---

## Phase 3: WebView Panel & UI Enhancements (May–June)

**Highlights:**
- Created WebView panel to show structured AI feedback (summary, code, explanation)
- Replaced code selection with AI result on Accept
- Introduced `applySuggestion`, webview message handling, and HTML escaping
- Logged accepted/rejected feedback (later removed)

**Challenges:**
- WebView messaging and security (CSP)
- Regex parsing for code blocks and section extraction

**Commits:**
- 2025-05-23: WebView panel with Accept/Reject
- 2025-05-25: Feedback logging for Reject
- 2025-05-28: AI reads full file and replaces full content
- 2025-05-29: Added streaming response support
- 2025-06-04: Styled with VS Code themes, added `jsdiff`
- 2025-06-05: Switched `jsdiff` to local file (offline safe)

---

## Phase 4: Preferences & Prompt Evolution (July)

**Highlights:**
- Introduced persistent AI coding preferences (stored via `globalState`)
- UI support in WebView to edit or clear preferences
- Preferences shown in WebView and injected into AI prompt
- Improved prompt clarity, stricter section headers, stronger formatting rules

**Challenges:**
- Managing preference re-run flow after updates
- Prompt became harder to parse due to streaming format

**Commits:**
- 2025-07-03: Added `set`, `show`, `clear` preferences
- 2025-07-04: Injected preferences into prompt + WebView UI buttons
- 2025-07-17: WebView reacts to cleared preferences
- 2025-07-18: Improved server error messages (Ollama down)

---

## Phase 5: UI Polish & Performance (July)

**Highlights:**
- Markdown rendering of AI response using `marked.js`
- F# syntax highlighting with `highlight.js`
- Split WebView HTML/JS/CSS into separate files
- Improved WebView layout, scrolling, and error handling

**Commits:**
- 2025-07-23: Add Markdown streaming render
- 2025-07-23: Add syntax highlighting with Highlight.js

---

## Notes

- Feedback logging (Accept/Reject) was later removed for simplicity and privacy.
- The AI model was switched from DeepSeek-Coder to Qwen2.5-Coder via Ollama in June.
- Focus has shifted toward offline functionality, performance, and usability.