## 2025-04-09
**Commit**: 9caa867
**Message**: Initial commit
**Description**: Create a project with `.gitignore` and `.md` files (`README.md`, `mvp.md` and `roadmap.md`)

## 2025-04-17
**Commit**: 92e0d95
**Message**: Add vs extension code with basic logic
**Description**: create a vs code extension project with some minimal logic like user selects code, show information message that contains selected code, accept and reject button with Git integration. If user click accept, then it will commit the changes, else, it will stage the chages 

## 2025-04-17
**Commit**: 27a4231
**Message**: Complete week #3 tasks
**Description**: make the code related to Git cleaner by creating functions of `getSelectedCode` and `getGitClient`

## 2025-05-11
**Commit**: 30aecfd
**Message**: finish week 4-5 tasks and update roadmap with week 5.5 tasks
**Description**: this is the first state of implementing the AI code review. I added the functions of `buildPrompt`, `queryDeepSeek` (from Ollama), then showing the AI output on VS code output panel and also on new Text Document with Mardown language on view column beside. All of the helper functions (these 2 new functions and `getSelectedCode` and `getGitClient`) are inside `utils/helpers.ts`.

## 2025-05-15
**Commit**: 70dc249
**Message**: add websharper docs in json format; organize extension codes
**Description**: separate 4 core commands (`AI review`, `Show Suggestion`, `Check Git Status` and `Undo Last Suggestion`) into `./commands/commandName.ts` (e.g. `./commands/aiReview.ts`). I also added a new file `./utils/showSuggestionHelpers.ts` with these functions: `extractSummary` (summary to be shown on `handleUserChoice` function with showing this onformation message `💡 AI Suggestion Summary:\n${summary}`), `handleUserChoice` (accept and reject with Git), `showOutput`, and `showWebview` (not export, just dummy function)

## 2025-05-23
**Commit**: 5428ed4
**Message**: add webview panel; add function of applying accepted suggestions to editor
**Description**: now we finally created the first functionality of webview panel (previously, we just showed the Text Document and Output). At this state, when user selects code, run `Show Suggestion` command (previously we triggered AI review code by running `Ai Review` command) then AI would give us a response on Webview panel (not streaming, just wait for the full response). On webview panel (webview content was a string on this state), there are 3 sections (Summary, Improved code and Explanation), Accept button (I removed the Git functionality and added the functionality of replacing the selected code with improved code), Reject button (also removed Git functionality and added functionality of showing information message).
**Chanllenge**:
    - **Create webview panel**: I didn't know how to create a webview panel and I needed to spend some times to read a docs about it
    - **Handle webview message**: need to read a docs about this as well like how we can handle the message that was sent from webview to extension and vice versa
    - **Using Regex pattern**: I had a function called `extractImprovedCode` which will extract the improved code from AI response that will be used to replace the selected code from user and I had to do a regex pattern. I also use regex for the response that will be shown on webview panel as well like if the response had `<` then it will be replaced with `&lt;` (HTML code), `**...**` then it will be replaced with `<strong>`

## 2025-05-23
**Commit**: f919a93
**Message**: add websharper docs from github
**Description**: get the websharper docs from GitHub for future AI fine-tuning by using RAG

## 2025-05-23
**Commit**: 67faa61
**Message**: fix: selected code is not replaced with AI improved code
**Description**: add `utils/applySuggestion.ts` for accept button and `logRejection` function in `utils/logging.ts` for reject button (when user click reject it will get the metadata and save them into `json` file)

## 2025-05-25
**Commit**: e3225a2
**Message**: adding log rejection feature
**Description**: Improved the "Reject" button on the AI Suggestion panel. Now when a user clicks "Reject", the extension saves a log with useful details like the file name, selected code, AI suggestion, full AI response, and selected range. These logs are stored in `.ai_feedback_log/rejections_log.json`. Changes include updating `showSuggestionHelpers.ts` to send this info, `logging.ts` to handle saving it, and the webview script to send the right message.

## 2025-05-25
**Commit**: 1b6de85
**Message**: fix: log rejection not working properly by removing unnecessarily code;
**Description**: Fixed the log rejection feature to make it work properly. Removed old and unused lines, and made sure the log now includes the correct details like selected code, AI response, and selection range. Also cleaned up how the improved code is extracted from the AI output and improved the webview message handling.

## 2025-05-28
**Commit**: ad6dcaf
**Message**: fix: log rejection by removing unnecessarily code
**Description**: wrong commit message. I deleted the emojis on the code like `✅ Changes committed with message: AI suggestion applied` and I removed `✅`

## 2025-05-28
**Commit**: 16b304a
**Message**: update docs with screenshots
**Description**: add screenshots of how the AI code review is working so far

## 2025-05-28
**Commit**: d832c52
**Message**: feat: AI can read the whole F# file
**Description**: Updated the prompt generation so that the AI now receives the entire F# file content along with the selected code. This helps the AI make smarter suggestions. Also cleaned up the old `aiReview` command and improved how the webview handles selections, responses, and full file context. The applied suggestion now replaces the whole file content if needed.

## 2025-05-29
**Commit**: 7cad182
**Message**: feat: make ai response stream
**Description**: Improved the extension so that AI responses now stream live into the webview instead of waiting for the full result. This makes the experience faster and more interactive. Added `queryAIStream` to handle streaming from Ollama, updated the webview to show loading text, stream content in real-time, and enable buttons after streaming ends (initial they are set to be disable). Also improved webview layout and added fallback logic for extracting the AI's suggested code.

## 2025-06-04
**Commit**: cfd2238
**Message**: update styles to be dynamic; delete unnecessary code
**Description**: Updated the webview styles to use VS Code theme variables, making the appearance adjust to the user's color theme. Removed some old and unused code, including the `handleUserChoice` logic, and simplified variable names for clarity in the `showSuggestion` feature. Also reduced the status bar display time for better UX.

## 2025-06-04
**Commit**: ad43579
**Message**: feat: add jsdiff for code comparison
**Description**: Added a visual diff viewer using the `jsdiff` library. Now the AI suggestion panel shows color-coded differences between the original and improved full file content. Green highlights added lines, red shows removed lines, and unchanged lines are dimmed. If `jsdiff` is unavailable or content is missing, the raw improved code is shown instead. Also updated the webview layout and styles for better readability.

## 2025-06-05
**Commit**: 6c1b693
**Message**: use local jsdiff file instead of CDN
**Description**: Replaced the CDN link for the `jsdiff` library with a local file to keep the extension fully offline and privacy-safe. Updated the webview to load the diff library from the local `webview-lib/diff.min.js` file using `asWebviewUri`. Also improved how diff lines are processed and displayed, ensuring better compatibility and offline functionality.

## 2025-06-05
**Commit**: 10a5836
**Message**: update logging to handle acception and rejection
**Description**: Combined the logging logic for accepted and rejected suggestions into a single function called `logFeedback`. Now both actions are stored in the same `feedback_log.json` file for better tracking. Also updated the Webview script and panel communication to include consistent metadata like file name, selected code, AI suggestion, and the full AI response. Improved error handling and added more secure Content-Security-Policy settings for scripts and styles for webview content codes.

## 2025-06-05
**Commit**: de94860
**Message**: update README.md
**Description**: Updated the README to reflect the switch from DeepSeek-Coder to Qwen2.5-Coder via Ollama. Adjusted setup instructions, model pull/run commands, and simplified the tech stack section. Also cleaned up duplicate or outdated notes about logging and backend.

## 2025-06-06
**Commit**: b6f9589
**Message**: refactor: project code structure
**Description**: Refactored the entire project to improve code organization and maintainability:
- Split `helpers.ts` into focused modules: `aiClient`, `promptBuilder`, `logging`, and `applySuggestion`.
- Moved all AI-related logic into a dedicated `ai/` folder.
- Created `webview/` and `ui/` folders to better separate UI logic (like panels and message handling).
- Updated `showSuggestion` and other commands to use the new structure.
- Removed the old `aiReview.ts` command and cleaned up unused code.

This makes the codebase easier to navigate and maintain.

## 2025-06-08
**Commit**: 60ee2e9
**Message**: add week 8 summary
**Description**: Added `week8-summary.md` to document the internal progress summary:
- Lists what’s working: AI streaming, WebView UI, Git integration, etc.
- Highlights gaps: missing doc-based prompt enrichment and feedback learning.
- Outlines current architecture and next steps.

Also marked completed roadmap tasks in `docs/roadmap.md` (Week 8 goals as [Done]).

## 2025-07-02
**Commit**: 76a9861
**Message**: delete everything related to feedback logs
**Description**:  
- Removed `logFeedback` usage and `logging.ts` file completely.
- Cleaned up `webviewMessageHandler.ts` by deleting all feedback logging logic.
- Reduced message payload in WebView JS by dropping unused log-related fields.
- Updated `index.ts` export list under `utils/ai/` to reflect these changes.

## 2025-07-03
**Commit**: 18d89ff
**Message**: add ai preferences with top loop
**Description**:  
- Introduced persistent AI preferences feature using `globalState`.
- Added commands to set, show, and clear preferences via `aiPreferences.ts`.
- Created `preferencesManager.ts` to manage input and retrieval logic.
- Hooked up commands in extension activation and exported them cleanly.
- Cleaned up WebView message payloads by consolidating code into a reusable builder function.

## 2025-07-03
**Commit**: 8781605
**Message**: add ai preferences commands to package.json
**Description**:  
- Registered AI preferences commands in `package.json` (`set`, `show`, `clear`) for command palette access.
- Fixed command identifiers in `aiPreferences.ts` to match `ai-code-review.*` namespace.
- Minor cleanup to reduce redundant wrapper syntax.

## 2025-07-04
**Commit**: 2ed1141
**Message**: add ai preference to the prompt
**Description**:  
- Integrated user-defined AI preferences directly into the prompt sent to the model.
- Renamed and corrected internal `getUserpreferences` to `getUserPreferences` (typo mistake) for consistency.
- Updated `buildPrompt` to be `async` and to include preferences in the final prompt block.
- Cleaned up logging and unnecessary debug output in WebView and extension logic.

## 2025-07-04
**Commit**: 27a1d69
**Message**: add minimal edit ai preference button on webview
**Description**:  
- Added a new button to the WebView UI: ✏️ Edit AI Preferences.
- When clicked, it triggers the `setAIPreferences` command using `vscode.commands.executeCommand`.
- Cleaned up `handleReject` logic and removed unused disposal calls.
- Minor UI and prompt handling improvements in `showSuggestion.ts`, including clearer validation and async prompt construction.
- Updated button state logic so all action buttons become active after AI response finishes.

## 2025-07-04
**Commit**: dd0074a
**Message**: enhance prompt and regex of summary and explanation sections
## 2025-07-04  
**Commit**: dd0074a  
**Message**: enhance prompt and regex of summary and explanation sections  
**Description**:  
- Refined the prompt template to improve clarity and enforce stricter formatting rules.
  - Reworded instructions to emphasize keeping unrelated code untouched.
  - Added clearer headings for "Summary of Issues", "Improved Code", and "Explanation".
- Improved the regex used to extract these sections from the AI's response:
  - Made it more tolerant of heading variations (e.g., Markdown or bold markers).
- Minor prompt style updates for better AI compliance.

## 2025-07-06
**Commit**: 891fa90
**Message**: rename extension commands and put AI preferences into Ai response section on webview
**Description**:  
- Renamed all command IDs from `ai-code-review.*` to `extension.*` for consistency with activation events.
- Displayed the user's current AI preferences directly in the suggestion WebView under a new **"Active AI Preferences"** section.
- Allowed editing AI preferences from this WebView via the ✏️ button.
- Triggered "Show Suggestion" immediately after saving preferences if the user agrees.
- Minor cleanup and WebView param updates for better context handling.

## 2025-07-14
**Commit**: 94d41ab
**Message**: add documentUri to ai-preference
**Description**:  
- Passed `documentUri` to `setUserPreferences()` so the AI can reopen the correct file after preferences update.
- When users click ✏️ "Edit AI Preferences" in the WebView:
  - The extension remembers the current file.
  - After saving preferences, it reopens the file and re-runs "Show Suggestion".
- Removed redundant prompt rules ("DO NOT repeat past mistakes...").

## 2025-07-17
**Commit**: 10a132a
**Message**: add clear preference
**Description**:  
- Added "🧹 Clear Preferences" button in the suggestion WebView.
- Implemented `clearUserPreferences()` to wipe stored preferences and update the WebView UI accordingly.
- WebView now shows updated preferences without reloading the whole panel.
- Unified `set`, `show`, and `clear` preference logic using a shared `rerunWebview()` function.
- Enhanced prompt instructions (clearer and stricter on formatting rules).

## 2025-07-17
**Commit**: 82331ae
**Message**: enhance prompt
**Description**:  
- Renamed internal `rerunWebvew` helper to `handlePreferenceUpdateFlow` for clarity.
- Updated prompt instruction to emphasize:
  - Use **"You MUST format your response as:"** (stronger directive).
  - Ended prompt with a clear **REMINDER**: "output the entire file content with ONLY the selected region changed."

## 2025-07-18
**Commit**: 6d55f8d
**Message**: add smooth scrolling and improved AI server error handling
**Description**:  
- **WebView UI**:  
  - Added smooth scroll-to-bottom animation while streaming AI responses.
- **AI Client (Ollama)**:  
  - Improved error feedback when the AI server is unreachable (e.g., Ollama not running).
  - Now shows a clear modal dialog if `fetch failed`, hinting users to check Ollama server.

## 2025-07-18
**Commit**: 538f243
**Message**: separate the webview content into their own individual files
**Description**:  
- **Refactored WebView system**:
  - Moved WebView HTML, script, and CSS into individual files:
    - `index.html`
    - `script.js`
    - `style.css`
  - Removed large embedded JS/HTML from `webviewContent.ts`
  - Added support to load these files dynamically via `localResourceRoots`
-  Maintains:
  - Diff rendering
  - Preference buttons (edit/clear)
  - AI stream handling
- Makes the UI code easier to maintain and test separately.

## 2025-07-23
**Commit**: 5f418b3
**Message**: render ai output stream by using markedjs library
**Description**:  
- **Improved Streaming Display**:
  - Replaced plain-text rendering with **Markdown rendering** using `marked.js`.
  - Enables formatting like `**bold**`, `code`, and headings in streamed AI content.
- **UI/UX Improvements**:
  - Adjusted HTML and CSS to better support dynamic Markdown content.
  - Styled `#streaming-response-area` for consistent theme appearance.
- **Prompt Format**:
  - Changed prompt bullet section headers to Markdown format (e.g., `### Summary of Issues`).

## 2025-07-23
**Commit**: 82495f0
**Message**: add marked.js library for streaming markdown rendering and highlight.js for F# syntax highlighter
**Description**:  
- **Markdown Rendering**:
  - Switched to `marked.js` for converting streamed AI text to formatted HTML.
- **Syntax Highlighting**:
  - Integrated `highlight.js` with F# syntax for accurate code colorization.
  - Added GitHub Dark theme for consistency with VS Code's dark mode.
- **Setup**:
  - Updated webview script and resource loading (`webviewContent.ts`) to include `marked.min.js`, `highlight.min.js`, `fsharp.min.js`, and CSS.
  - Modified CSP and paths to safely load local JS libraries.