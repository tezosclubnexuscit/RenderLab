<h1 align="center">🛠️ RenderLab — AI-Powered Frontend Practice Suite</h1>

<p align="center">
  <b>A modern, LeetCode-style interactive workspace built for frontend engineers to master real-world HTML, CSS, and JavaScript across 311 progressive challenges.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-emerald?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Challenges-311_Total-blue?style=for-the-badge" alt="Challenges" />
  <img src="https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" />
</p>

---

## 💫 About RenderLab

Hey! 👋

* **RenderLab** is an open-source, full-stack practice environment designed specifically for frontend engineers.
* Pre-loaded with **311 structured, hand-crafted challenges** strictly ordered from beginner to advanced across **HTML (#1–#103)**, **CSS (#104–#209)**, and **JavaScript (#210–#311)**.
* Features a high-performance **3-Panel IDE Workspace** powered by the **Monaco Editor** (VS Code engine) with full multi-tab HTML, CSS, and JS editing.
* Includes a **Dual Visual Comparison Engine**: preview your live code in a sandboxed iframe while comparing it side-by-side against the **Expected Reference Output**.
* Equipped with an **Automated In-Browser Test Suite** evaluating DOM structure, computed CSS styles, and JavaScript interactions with live test assertions.
* Powered by a flexible **Dual-LLM Architecture**: run completely offline using **Local Ollama** (with an in-app 1-click model installer & download streamer) or connect to **Cloud AI APIs** (Google Gemini, OpenAI, Groq, Anthropic Claude).
* Features an **AI Challenge Generator Modal** supporting 311 blueprint templates, sequential numerical list selection, and resilient challenge generation with automatic blank enforcement (so starter code never reveals the solution).

---

## 💻 Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Monaco_Editor-1E1E1E?style=for-the-badge&logo=visual-studio-code&logoColor=007ACC" alt="Monaco Editor" />
  <img src="https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Groq_Cloud-F55036?style=for-the-badge&logo=fastapi&logoColor=white" alt="Groq Cloud" />
</p>

---

## 🚀 Key Highlights & Capabilities

### 🖥️ 1. LeetCode-Style 3-Panel IDE
* **Left Panel**: Problem description, difficulty badge, estimated completion time, interactive requirements checklist, hints, and past attempt history.
* **Center Panel**: Multi-tab code editor powered by Monaco Editor (`index.html`, `styles.css`, `script.js`) with syntax formatting, keyboard shortcuts, code reset, and copy actions.
* **Right Panel**: Dual-tab preview with live isolated iframe rendering, responsive device switcher (Desktop, Tablet, Mobile), console log viewer, and automated test result assertions.

### 🎯 2. Dual Visual Comparison Engine
* **Target Output Preview**: Visual card on the left panel plus a dedicated **Expected Output** tab showing the exact reference design.
* **Live Sandbox Preview**: Real-time rendering of your working solution with sandboxed security (`allow-scripts allow-same-origin allow-modals`) and zero screen-flicker.

### 📚 3. 311 Curriculum Challenges Categorized & Sequenced
Challenges are organized across 3 main categories, numbered strictly from `#1` to `#311`:
* **HTML (#1 to #103)**: Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`), accessible forms, validation, native dialogs, responsive `<picture>`, `<details>`, `<template>`, `<meter>`, tables, and micro-markup.
* **CSS (#104 to #209)**: Modern Flexbox layouts, CSS Grid auto-fit galleries, keyframe animations, glassmorphism, 3D card flips, responsive navigation drawers, CSS variables, and design systems.
* **JavaScript (#210 to #311)**: Event delegation, DOM manipulation, asynchronous fetching, debounce/throttle utilities, modal controller patterns, form validation regex, canvas animations, and state machines.

### 🧩 4. 4 Distinct Challenge Modes
* 📝 **Fill in the Blanks** (`fill_blanks`): Complete designated `TODO` sections and blank properties in starter code. Starter code never reveals the solution.
* 🐛 **Fix the Broken Code** (`fix_broken`): Diagnose subtle bugs, broken accessibility tags, layout overflows, or faulty event listeners.
* 🏗️ **Build Component** (`build_component`): Build full interactive components from minimal skeletal scaffolding.
* 🎨 **Recreate Design** (`recreate_page`): Replicate UI designs and page layouts matching the reference output pixel-for-pixel.

### 🤖 5. Dual LLM Architecture & Challenge Generator
* **Local Offline AI (Ollama)**:
  * Automatically detects local daemon status on port `11434`.
  * **1-Click Model Installer**: Install coding models (`qwen2.5-coder:1.5b`, `qwen2.5-coder:7b`, `deepseek-coder:6.7b`, `llama3.1:8b`) with real-time download streaming.
* **Cloud AI Providers**:
  * Native integrations for Google Gemini (`gemini-2.5-flash`), OpenAI (`gpt-4o-mini`), Groq (`llama-3.3-70b`), and Anthropic Claude.
* **Resilient Challenge Generator**:
  * Quick-search and browse all 311 challenge blueprints formatted as a sequential numerical list (`#1` to `#311`).
  * Automatic schema normalization and blank creation prevents starter code from revealing the solution.
  * Resilient fallback to curriculum blueprints ensures zero 422 errors even if the local LLM is offline.

---

## 🗄️ Database Schema & Curriculum Portability

RenderLab uses **SQLite** with **SQLAlchemy 2.0 ORM** for persistent local storage (`backend/practice_suite.db`).

### 📦 Portable 311 Curriculum
All 311 challenges are versioned directly in Git inside:
* `backend/app/data/curriculum_311.json` (Full challenge specifications, tests, starter and solution code)
* `frontend/src/data/blueprints_311.json` (Optimized challenge generator blueprints)

When you or a friend clone the repository and start the server, `seed_database()` automatically imports and syncs all 311 challenges into the SQLite database on launch.

---

## ⚡ Quick Start

### Prerequisites
* **Node.js** 18+ ([Download](https://nodejs.org/))
* **Python** 3.11+ ([Download](https://www.python.org/))
* *(Optional)* **Ollama** for offline AI ([Download](https://ollama.com/))

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/RenderLab.git
cd RenderLab
```

### 2. Backend Virtual Environment
```powershell
# Windows
python -m venv backend\venv
backend\venv\Scripts\activate
pip install -r backend\requirements.txt

# Linux / macOS
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Frontend Installation
```bash
cd frontend
npm install
cd ..
```

### 4. Launch Application

#### 🚀 Option A: One-Click Launch (Windows)
```powershell
.\start.bat
```
To stop all processes gracefully:
```powershell
.\stop.bat
```

#### 🛠️ Option B: Manual Launch
```powershell
# Terminal 1 — Backend API:
backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Frontend:
cd frontend
npm run dev
```

* Open your browser at **`http://localhost:5173`**
* Interactive Swagger API docs available at **`http://127.0.0.1:8000/docs`**

---

## 📡 API Reference

<details>
<summary><b>Click to expand full REST API endpoints</b></summary>

### Challenges (`/api/challenges`)
* `GET /api/challenges` — List all challenges with optional filters (`difficulty`, `mode`, `topic`, `search`).
* `GET /api/challenges/{id}` — Get complete challenge payload with starter code, solution, requirements & tests.
* `POST /api/challenges` — Create a custom challenge manually.
* `POST /api/challenges/generate` — Generate a validated challenge using active LLM or curriculum blueprint.
* `DELETE /api/challenges/{id}` — Delete a challenge and cascading attempts/tests.

### Submissions (`/api/submissions`)
* `POST /api/submissions` — Submit solution; records passed tests, score, and execution time.
* `GET /api/submissions/attempts` — Get past attempt history.

### AI & Configuration (`/api/config/llm`)
* `GET /api/config/llm` — Fetch current AI configuration.
* `PUT /api/config/llm` — Update active provider, model, and credentials.
* `POST /api/config/llm/test` — Test provider connection and measure latency.
* `GET /api/config/llm/ollama/status` — Check Ollama daemon and list installed models.
* `POST /api/config/llm/ollama/start` — Launch local Ollama daemon.
* `POST /api/config/llm/ollama/install` — Stream-download a new Ollama model.
* `POST /api/llm/hint` — Generate interactive AI hints or answer tutor questions.

### Progress (`/api/progress`)
* `GET /api/progress` — Fetch user progress summary, solved counts, and topic metrics.

</details>

<p align="center">
  Made with ❤️ for frontend developers worldwide.
</p>
