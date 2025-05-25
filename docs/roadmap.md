# 🧠 AI-Powered Code Review VS Code Extension – 5-Month Thesis Roadmap

📅 **Development Period:** April 10 – August 31  
📝 **Thesis Writing:** September – October  
🎓 **Defense:** November – December

---

## ✅ Month 1: Planning & Project Setup (April)

### Week 1: Kickoff & MVP Planning (Done)

- Define MVP scope and feature list
- Set up Git repo and initial file structure
- Write initial docs: `README.md`, `docs/mvp.md`, `docs/roadmap.md`
- Install & test Ollama with DeepSeek-Coder 6.7B Instruct

### Week 2: VS Code Extension Skeleton (Done)

- Scaffold extension with `yo code`
- Create basic command and activation logic
- Add Accept/Reject buttons and placeholder suggestion

### Week 3: Git Integration Basics (Done)

- Implement Accept = commit, Reject = stage
- Test undo/restore feature using Git
- Commit demo interaction

### Week 4: Prompt Design & F# Code Handling (Done)

- Design prompt templates for DeepSeek
- Extract selected F# code from editor
- Test sending prompt → get response

---

## ✅ Month 2: Core Functionality (May)

### Week 5: AI Suggestion Integration (Done)

- Connect extension to local DeepSeek-Coder
- Replace placeholder with real AI suggestions
- Display code + explanation in output panel

### Week 5.5: WebSharper Doc Scraping & Context Injection (lightweight RAG)

- Chunk and store docs (as .json, .md, or in-memory strings)

- Build simple keyword-based retriever (matchTopic("Var") → doc)

- Inject top-matching doc chunks into prompt before the selected code

- Test DeepSeek-Coder response improvement using enriched prompt

### Week 6: Code Application

- Apply accepted suggestions to editor [Done]
- Highlight modified lines (Optional)
- Log rejection without modifying file
- Read the whole project file
- Add diff file

### Week 7: Feedback Logging System

- Track accept/reject feedback with timestamp
- Save to local JSON or SQLite
- Associate with file/function context

### Week 8: Mini Review & Demo

- Record a 1–2 min demo of current extension
- Write short internal dev summary
- Refactor or catch up if needed

---

## ✅ Month 3: Learning & Interaction (June)

### Week 9: Feedback-Driven Personalization

- Suppress repeated rejected suggestions
- Prioritize accepted patterns in prompt
- Test "learning loop" over time

### Week 10: Git Enhancements

- Show diff preview before applying suggestion
- Add "Undo Last Suggestion"
- Optionally: store AI commits in separate branch

### Week 11: Testing with Real Projects

- Use sample F# + WebSharper repos
- Measure speed, accuracy, and UX
- Identify edge cases or crashes

### Week 12: User Interface Polish

- Improve suggestion UI (colors, hover, tooltips)
- Add hotkeys / keyboard support
- Finalize Accept/Reject layout

---

## ✅ Month 4: Feature Freeze & Stability (July)

### Week 13: Finalize Features

- Lock feature scope
- Refactor messy code / remove unused logic
- Cleanup project folders

### Week 14: Packaging & Docs

- Create installable `.vsix` package
- Write user guide + dev setup docs
- Finalize project README

### Week 15: Internal Test Session

- Do a “clean install” test
- Use it end-to-end on a real repo
- Log bugs, notes, future TODOs

### Week 16: Optional Stretch Goals

- WebSharper-specific prompt tuning
- Add inline comment generation
- Generate test cases from code

---

## ✅ Month 5: Final Testing & Submission (August)

### Week 17 (Aug 1–10): Final Testing Phase

- Run multi-session test
- Review feedback logging accuracy
- Final review of Git interaction + logs

### Week 18 (Aug 11–17): Final Bug Fixes

- Fix all critical bugs
- Polish UI/UX further
- Final GitHub commit cleanup

### Week 19 (Aug 18–24): Deliverables

- Prepare final demo video
- Upload project to GitHub
- Tag release, push all docs

### Week 20 (Aug 25–31): Project Submission

- Submit code, documentation, demo link
- Take screenshots for thesis writing
- Rest 😌

---

## 📝 September–October: Thesis Writing

- Write introduction, methodology, implementation, evaluation
- Include screenshots, charts, and feedback analysis
- Finalize and submit written thesis

## 🎓 November–December: Defense Prep

- Build slides
- Prepare live demo + Q&A
- Pass defense confidently 💪
