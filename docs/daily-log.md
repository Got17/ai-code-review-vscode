# AI Code Review Extension – Daily Log

This document captures daily or weekly development activities, decisions, and reflections to support thesis documentation and future retrospectives.

---

### [2025-07-24]
**Tasks Completed:**
- Added `rough-notes.md`, `rough-history.md`, and `daily-log.md` to track project progress for thesis documentation.
- Refactored `handlePreferenceUpdateFlow` by splitting logic into smaller reusable functions.
- Created `promptAndRunShowSuggestionCommand` and `showConfirmationPrompt` for better UX and clarity.
- Updated `promptBuilder.ts` instructions to simplify Markdown output formatting.
- Added user feedback message ("AI suggestion rejected.") in `webviewMessageHandler.ts`.

**Design Decisions:**
- Decided to maintain three documentation layers: raw Git log (`rough-history`), phase summaries (`rough-notes`), and day-to-day logs (`daily-log`).
- Improved modularity in preference update logic to support reuse across commands.
- Simplified prompt formatting for more consistent AI responses in Markdown view.

**Challenges:**
- Needed to ensure refactors didn't break the user flow (especially when editing preferences or rejecting suggestions).

**Solutions / Fixes:**
- Carefully preserved fallback logic and confirmed edge cases like missing `documentUri`.
- Manually tested the new reject message and preference update confirmation dialog.

**Next Steps / TODO:**
- Reuse `showConfirmationPrompt` in other confirm flows (e.g., undo, clear logs).
- Consider making prompt section headers (`Summary of Issues`, etc.) configurable or constant-based.

**Reflections:**
- Having structured documentation now makes it easier to see how the project has evolved.
- Refactoring is not just cleanup — it sets the stage for better reusability and fewer bugs later.