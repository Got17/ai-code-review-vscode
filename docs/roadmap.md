# AI-Powered Code Review VS Code Extension Thesis – Weekly Roadmap (16 Weeks)

## ✅ Month 1: Planning, Setup & Foundation (Weeks 1–4)

### Week 1: Kickoff & Planning

- Define MVP (Minimum Viable Product) scope and final feature list
- Set up Git repo and project structure
- Write initial project documentation (`README.md`, goals, tech stack)
- Install and test Ollama with DeepSeek-Coder locally

### Week 2: VS Code Extension Skeleton

- Scaffold extension using VS Code Extension API + TypeScript
- Add basic UI: command palette, webview/panel
- Display placeholder suggestion and Accept/Reject buttons
- Commit progress with Git

### Week 3: Git Integration

- Add basic Git hooks: Accept = commit, Reject = stage only
- Automate Git actions from the extension using `simple-git` or `child_process`
- Test rollback, restore original code features

### Week 4: F# Code Parsing & Prompt Design

- Add support for detecting F# files and extracting code snippets
- Design prompt templates to send to DeepSeek
- Test first AI suggestion response (manual query)

---

## ✅ Month 2: Core Functionality (Weeks 5–8)

### Week 5: AI Suggestion Integration

- Connect extension to local AI backend via Node.js API
- Display real suggestions from DeepSeek-Coder
- Return explanations along with suggestions

### Week 6: Apply Suggestions to Code

- Replace selected code with AI suggestion on Accept
- Leave code unchanged on Reject, but log feedback
- Refactor suggestion formatting/styling in panel

### Week 7: Feedback Logging System

- Store Accept/Reject data locally (JSON or SQLite)
- Track frequency, file context, timestamps
- Prepare for basic learning logic

### Week 8: Mini Demo + Sync

- Review all progress
- Record a basic demo (for documentation/supervisor)
- Catch up on anything delayed
- Prepare mid-point update notes for internal use

---

## ✅ Month 3: Learning System & Refinement (Weeks 9–12)

### Week 9: Interactive Learning Logic

- Implement basic filtering (e.g., don’t show previously rejected suggestions)
- Prioritize patterns that were accepted often
- Improve feedback loop

### Week 10: Advanced Git Features

- Add history navigation (“undo” accepted suggestion)
- View diff before applying changes
- Optional: snapshot preview in webview

### Week 11: Performance Testing

- Test on large F# project
- Measure response time, Git integration reliability
- Fix issues, optimize code

### Week 12: UX Improvements

- Add tooltips, hover info, shortcut keys
- Polish messages, edge cases, error handling
- Finalize UI design

---

## ✅ Month 4: Testing, Thesis Writing & Final Submission (Weeks 13–16)

### Week 13: Thesis Writing – Part 1

- Write introduction, purpose, and methodology
- Add screenshots of setup, Git integration, feedback logic

### Week 14: Thesis Writing – Part 2

- Document implementation process
- Write evaluation, testing, conclusion
- Format bibliography and references

### Week 15: Full Testing & Polish

- Final tests across multiple F# files/projects
- Fix bugs, polish UX
- Create final presentation/demo

### Week 16: Final Submission

- Submit thesis document
- Push final code to GitHub
- Prepare for thesis defense (slides, notes, demo walkthrough)
