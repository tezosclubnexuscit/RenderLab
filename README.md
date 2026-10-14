<h1 align="center">🛠️ DevForge — AI-Powered Frontend Practice Suite</h1>

<p align="center">
  <b>A modern, LeetCode-style interactive workspace built for frontend engineers to master real-world HTML, CSS, and JavaScript.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-emerald?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome" />
</p>

---

## 💫 About The Project :

Hey ! 👋

* **DevForge** is an open-source, full-stack practice environment designed specifically for frontend web developers.
* Features a high-performance **3-Panel IDE Workspace** powered by the **Monaco Editor** (VS Code engine) with full multi-tab HTML, CSS, and JS support.
* Includes a **Dual Visual Comparison Engine**: preview your live code in a sandboxed iframe while comparing it side-by-side against the **Expected Reference Output**.
* Equipped with an **Automated In-Browser Test Suite** that evaluates DOM structure, computed CSS styles, and JavaScript interactions with live feedback and confetti celebrations.
* Powered by a flexible **Dual-LLM Architecture**: run completely offline using **Local Ollama** (with an in-app 1-click model installer & download streamer) or connect to **Cloud AI APIs** (Google Gemini, OpenAI, Groq, Anthropic Claude).
* Comes pre-loaded with **10 curated, deduplicated challenges** across 4 modes, plus an **AI Challenge Generator** to generate infinite custom challenges on demand.

---

## 💻 Tech Stack :

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

## 🚀 Key Highlights & Capabilities :

### 🖥️ 1. LeetCode-Style 3-Panel IDE
* **Left Panel**: Problem description, difficulty badge, estimated completion time, interactive requirements checklist, static clues, and past attempt history.
* **Center Panel**: Multi-tab code editor powered by Monaco Editor (`index.html`, `styles.css`, `script.js`) with syntax formatting, keyboard shortcuts, code reset, and copy actions.
* **Right Panel**: Dual-tab preview with live isolated iframe rendering, responsive device switcher (Desktop, Tablet, Mobile), console log viewer, and automated test result assertions.

### 🎯 2. Dual Visual Comparison Engine
* **Target Output Preview**: Visual card on the left panel plus a dedicated **Expected Output** tab on the right panel showing the exact target reference UI.
* **Live Sandbox Preview**: Real-time rendering of your working solution with sandboxed security (`allow-scripts allow-same-origin allow-modals`) and zero screen-flicker or recursive loading.

### 🤖 3. Dual LLM Architecture & In-App Model Installer
* **Local Offline AI (Ollama)**:
  * Automatically detects local daemon status on port `11434`.
  * **1-Click Model Installer**: Install coding models (`qwen2.5-coder:1.5b`, `qwen2.5-coder:7b`, `deepseek-coder:6.7b`, `llama3.1:8b`) directly in the app with real-time download streaming & MB progress.
  * One-click **Start Ollama** button if the local daemon is offline.
* **Cloud AI Providers**:
  * Native integrations for Google Gemini (`gemini-2.5-flash`), OpenAI (`gpt-4o-mini`), Groq (`llama-3.3-70b`), Anthropic Claude, and custom OpenAI-compatible endpoints.
  * Built-in connection tester with millisecond latency ping.

### 💡 4. Interactive AI Tutor Chat
* **Contextual Explanations**: Ask custom questions about your code or why a specific test assertion failed.
* **Socratic Guidance**: Delivers progressive, pedagogical hints without spoiling the full solution.
* **Chat History**: Preserves conversation context across the solving session.

### 🧩 5. 4 Practice Modes Supported
* 📝 **Fill in the Blanks** (`fill_blanks`): Complete designated `TODO` sections and blank properties in starter code.
* 🐛 **Fix the Broken Code** (`fix_broken`): Diagnose bugs, resolve conflicting CSS rules, or fix faulty event listeners.
* 🏗️ **Build Component** (`build_component`): Build full interactive components from functional specifications.
* 🎨 **Recreate Page** (`recreate_page`): Replicate UI designs and page layouts matching the reference output.

---

## 📚 Curated Practice Suite (10 Unique Challenges) :

| # | Challenge Name | Difficulty | Mode | Key Topics Covered |
|:---:|---|:---:|:---:|---|
| **01** | **Interactive Glow Button** | `Easy` | Fill in Blanks | CSS Transitions, `:hover`, Box Shadow Glow |
| **02** | **Centered Responsive Navigation Bar** | `Easy` | Fill in Blanks | CSS Flexbox, Alignment, Navigation Header |
| **03** | **Interactive Counter Component** | `Medium` | Fill in Blanks | DOM Events, State Management, Dynamic Styling |
| **04** | **Buggy Modal Dialog** | `Medium` | Fix Bugs | Modal Overlay, Event Listeners, CSS Specificity |
| **05** | **FAQ Accordion with Animated Expansion** | `Medium` | Build Component | CSS Max-Height Transition, Icon Rotation, DOM Toggling |
| **06** | **Basic CSS Styling Challenge** | `Easy` | Fill in Blanks | Container Styling, Typography, Button Effects |
| **07** | **CSS Grid Photo Gallery** | `Easy` | Fill in Blanks | Responsive CSS Grid, `repeat(auto-fit)`, Gap Spacing |
| **08** | **Countdown Timer With Pause** | `Easy` | Fill in Blanks | JavaScript `setInterval`, Timer State, DOM Updates |
| **09** | **Animated Toggle Switch** | `Easy` | Fix Bugs | CSS Slider Animations, Checkbox Logic, Transitions |
| **10** | **Easy JavaScript Form Validation** | `Easy` | Fill in Blanks | Regex Validation, Form Submit Events, Error Messages |

*✨ Users can also delete any unwanted challenges with 1-click in the browser or generate infinite new challenges using the AI Challenge Generator.*

---

## 🗄️ Database Schema & Initialization :

DevForge utilizes **SQLite** with **SQLAlchemy 2.0 ORM** for persistent local storage (`backend/practice_suite.db`).

### 📊 Database Tables Architecture

| Table Name | Description | Key Columns / Relations |
|---|---|---|
| `challenges` | Stores problem specs, difficulty, mode, starter & solution code. | `id` (PK), `title`, `description`, `difficulty`, `mode`, `starter_html`, `starter_css`, `starter_js`, `solution_html`, `solution_css`, `solution_js`, `requirements_json`, `hints_json`, `is_approved`, `created_at` |
| `test_cases` | Automated test suite assertions per challenge. | `id` (PK), `challenge_id` (FK ➔ `challenges.id`, `CASCADE`), `test_id`, `description`, `test_type` (`dom`/`css`/`js`), `selector`, `property_name`, `expected_value`, `assertion_code`, `order_index` |
| `attempts` | Submission logs and execution metrics. | `id` (PK), `challenge_id` (FK ➔ `challenges.id`, `CASCADE`), `code_html`, `code_css`, `code_js`, `status` (`passed`/`failed`), `passed_count`, `total_count`, `execution_time_ms`, `created_at` |
| `attempt_results` | Granular per-test results for each submission attempt. | `id` (PK), `attempt_id` (FK ➔ `attempts.id`, `CASCADE`), `test_id`, `description`, `passed`, `message` |
| `llm_settings` | Active AI provider configuration & credentials. | `id` (PK), `provider` (`ollama`/`gemini`/`openai`/`groq`/`anthropic`/`custom`), `base_url`, `model`, `api_key`, `temperature`, `updated_at` |

---

### ⚙️ How to Create & Seed the Database Schema

#### 1. Automatic Schema Creation (Default)
When you start the backend server, the FastAPI application `lifespan` handler automatically invokes `init_db()` and `seed_database()`. It creates `backend/practice_suite.db` and populates the starter challenge suite if empty:
```powershell
backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Manual CLI Schema Creation & Seeding
To manually create all tables and populate initial challenges via Python script:
```powershell
# Windows
backend\venv\Scripts\python.exe -c "from backend.app.models.database import init_db; from backend.app.seed_data import seed_database; init_db(); seed_database(); print('Schema created and default challenges seeded!')"

# Linux / macOS
backend/venv/bin/python3 -c "from backend.app.models.database import init_db; from backend.app.seed_data import seed_database; init_db(); seed_database(); print('Schema created and default challenges seeded!')"
```

#### 3. Resetting / Rebuilding Database From Scratch
If you ever want to completely reset challenges, clear test attempts, or start fresh:
```powershell
# 1. Delete SQLite database file
Remove-Item backend\practice_suite.db -Force

# 2. Re-create and seed fresh schema
backend\venv\Scripts\python.exe -c "from backend.app.models.database import init_db; from backend.app.seed_data import seed_database; init_db(); seed_database(); print('Database freshly rebuilt!')"
```

---

## ⚡ Quick Start :

### Prerequisites
* **Node.js** 18+ ([Download](https://nodejs.org/))
* **Python** 3.11+ ([Download](https://www.python.org/))
* *(Optional)* **Ollama** for offline AI ([Download](https://ollama.com/))

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/DevForge.git
cd DevForge
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

## 📡 API Reference :

<details>
<summary><b>Click to expand full REST API endpoints</b></summary>

### Challenges (`/api/challenges`)
* `GET /api/challenges` — List all challenges with optional filters (`difficulty`, `mode`, `topic`, `search`).
* `GET /api/challenges/{id}` — Get complete challenge payload with starter code, solution, requirements & tests.
* `POST /api/challenges` — Create a custom challenge manually.
* `POST /api/challenges/generate` — Generate a validated challenge using active LLM.
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
