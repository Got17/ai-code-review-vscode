# AI-Powered Code Review Extension for VS Code

## 📌 Overview

This project is a VS Code extension that provides AI-generated code review suggestions for F# and WebSharper code. It analyzes selected code and suggests improvements in readability, performance, and maintainability using a locally hosted LLM.

## ✨ Key Features

- Code optimization suggestions from AI (DeepSeek-Coder via Ollama)
- Accept/Reject interface with real-time feedback
- Git version control integration:
  - Accept → auto-commit
  - Reject → stage change only
- Fully local operation (no cloud dependency)
- Learns from user interaction to personalize future suggestions

## 🛠️ Tech Stack

- VS Code Extension API (TypeScript)
- Node.js (optional backend for local LLM bridge)
- DeepSeek-Coder via [Ollama](https://ollama.com)
- Git CLI (via Node scripts or `simple-git`)
- Optional: SQLite / JSON for feedback logging

## 🚀 Getting Started

1. Install [Ollama](https://ollama.com)
2. Pull the model: `ollama pull deepseek-coder`
3. Run: `ollama run deepseek-coder`
4. Launch the extension in development mode

## 📂 Project Structure

```text
ai-code-review-vscode/
├── extension/     # VS Code extension source
├── docs/          # Planning, roadmap, and thesis content
│   └── roadmap.md
├── .gitignore
├── README.md
```
