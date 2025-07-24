# AI Code Review Extension – Daily Log

This document captures daily or weekly development activities, decisions, and reflections to support thesis documentation and future retrospectives.

---

### [2025-07-24]
**Tasks Completed:**
- Refactored `handlePreferenceUpdateFlow` in `preferencesManager.ts` to separate confirmation logic.
- Created a reusable `promptAndRunShowSuggestionCommand` and `showConfirmationPrompt` for cleaner preference handling.
- Updated `promptBuilder.ts` to simplify AI instructions (removed redundant "entire file inside ```fsharp").
- Improved rejection feedback UX by adding a confirmation message in `webviewMessageHandler.ts`.

**Design Decisions:**
- Modularized confirmation and prompt execution to improve reusability and clarity.
- Adjusted prompt wording for cleaner Markdown rendering and clearer AI behavior.

**Challenges:**
- Wanted to make changes without breaking how things worked before.

**Solutions / Fixes:**
- Double-checked fallback logic and tested reject button message.

**Next Steps / TODO:**
- Reuse the confirm message helper in other parts of the code.
- Maybe move prompt text headers into constants.

**Reflections:**
- Splitting big functions into smaller ones makes the code cleaner.
- Small UI messages like "AI suggestion rejected." make the tool feel more responsive.