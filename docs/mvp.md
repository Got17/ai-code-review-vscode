# 📌 MVP Scope – AI-Powered VS Code Code Review Extension

## 🎯 Minimum Features for Delivery

### 🔍 Core Functionality

- [ ] User can select F# code in editor
- [ ] Code is sent to local DeepSeek-Coder model
- [ ] Extension returns optimization suggestion + explanation
- [ ] Suggestions shown in a panel or popup

### ✅ Interactive Feedback

- [ ] Accept button:
  - Applies suggestion
  - Commits change with Git (`git commit`)
- [ ] Reject button:
  - Stages suggestion only (`git add`)
  - Doesn’t commit

### 🧠 Learning Behavior

- [ ] Store Accept/Reject metadata locally (JSON or SQLite)
- [ ] Adapt future suggestions based on user preferences

### 🔐 Local & Secure

- [ ] Everything works offline
- [ ] No API calls to external servers
- [ ] Uses Ollama for local LLM inference

## 📦 MVP Deliverables

- VS Code extension (packaged and installable)
- README + user guide
- Demo video
- Thesis document with screenshots & evaluation
