# AI-Powered Frontend Practice Suite — Development Plan

## 1. Project Overview

Build a LeetCode-style platform for frontend development practice. Users receive coding challenges, complete missing code or build a page, preview their work in a sandbox, and submit it for automated evaluation. A local LLM generates and helps validate challenges so the platform can run primarily on the user's machine.

### Core user flow

1. Choose a challenge by topic and difficulty.
2. Read the prompt, requirements, and expected behavior.
3. Complete the provided HTML, CSS, and JavaScript or build the requested page.
4. Preview the result in an isolated iframe.
5. Submit the solution.
6. Run automated checks and show passed/failed tests with useful feedback.
7. Save progress and revisit previous attempts.

## 2. Recommended MVP Scope

Start with a focused MVP rather than implementing every feature at once.

### Must-have features

- Challenge list with difficulty and topic filters
- Challenge details and requirements
- Code editor with HTML, CSS, and JavaScript support
- Starter code and editable solution area
- Live preview in a sandboxed iframe
- Run and reset controls
- Submit button with automated test results
- Local challenge generation using Ollama
- Challenge validation before users see generated tasks
- Basic progress tracking

### Add later

- User accounts and cloud synchronization
- Leaderboards and streaks
- Shared challenge collections
- Multiple challenge modes and hints
- AI-generated explanations of failed tests
- Export/import challenge packs

## 3. Suggested Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite + TypeScript | Application UI |
| Styling | Tailwind CSS | Consistent interface and rapid styling |
| Code editor | Monaco Editor | VS Code-like editing experience |
| Preview | Sandboxed iframe | Render submitted HTML/CSS/JS separately from the app |
| Backend API | FastAPI | Challenge, validation, and submission endpoints |
| Local LLM | Ollama with a coding model | Generate challenge drafts and hints |
| Validation | Pydantic | Validate challenge structure and metadata |
| Browser testing | Playwright | Execute browser-based checks |
| Database | PostgreSQL | Persist challenges, attempts, and progress |
| ORM/migrations | SQLAlchemy + Alembic | Database access and schema migrations |
| Version control | Git + GitHub | Source control and collaboration |

For the first local prototype, SQLite can replace PostgreSQL to reduce setup work. Move to PostgreSQL when the data model and workflows stabilize.

## 4. High-Level Architecture

```text
React + Vite UI
  ├── Challenge browser
  ├── Monaco editor
  ├── Live preview iframe
  └── Results and progress panel
          │
          ▼
       FastAPI
  ├── Challenge API
  ├── LLM generation service ─── Ollama
  ├── Challenge validation
  ├── Submission service
  └── Test runner integration ── Playwright
          │
          ▼
      Database
  ├── Challenges
  ├── Test cases
  ├── Attempts
  └── User progress
```

Keep challenge generation separate from challenge execution. The LLM should create a proposed challenge; deterministic validation and tests should decide whether it is safe and usable.

## 5. Challenge Modes

Design the data model so the platform can support several modes without redesigning the whole system.

### Mode A: Fill in the blanks

Users complete marked sections in starter code. This is the easiest mode to implement and grade reliably.

### Mode B: Fix the broken code

Users inspect a partially working page and correct bugs. Tests verify the required behavior.

### Mode C: Build a component

Users implement a component from a visual or written specification, such as a responsive card, navbar, modal, or form.

### Mode D: Recreate a page

Users build a page from a reference image or detailed layout requirements. Start with basic visual checks; pixel-level scoring can be added later.

**Recommendation:** Launch with Modes A and B. Add component-building next, then page recreation after the test and preview infrastructure is stable.

## 6. Challenge Data Model

A challenge should be stored as structured data rather than a free-form LLM response.

```json
{
  "id": "button-hover-001",
  "title": "Create a Hover Button",
  "description": "Build a button that changes appearance when hovered.",
  "difficulty": "easy",
  "topics": ["css", "hover", "buttons"],
  "mode": "fill_blanks",
  "starter_code": {
    "html": "<button class=\"action-button\">Submit</button>",
    "css": "/* Add hover styles here */",
    "javascript": ""
  },
  "requirements": [
    "The button must have a visible hover state.",
    "The button must remain readable in both states."
  ],
  "tests": [
    {
      "id": "button-exists",
      "type": "dom",
      "description": "A button is rendered"
    }
  ],
  "hints": ["Use the :hover pseudo-class."],
  "estimated_minutes": 10
}
```

Treat this as an illustrative schema. Define strict Pydantic models and refine the exact test format as implementation begins. Do not allow generated challenge data to contain arbitrary backend instructions or executable server-side code.

## 7. LLM Challenge Generation Pipeline

Use the local model to draft challenges, not to make the final decision about correctness.

1. **Choose generation parameters:** topic, difficulty, mode, and learning objective.
2. **Generate structured JSON:** request a challenge matching a strict schema.
3. **Parse and validate:** use Pydantic to reject malformed fields, missing requirements, or unsupported test types.
4. **Check completeness:** ensure starter code, instructions, expected behavior, and tests agree.
5. **Run smoke tests:** execute the challenge in an isolated browser environment.
6. **Reject or repair:** if validation fails, request a bounded repair attempt or discard the draft.
7. **Store approved challenges:** save only challenges that pass validation.

Keep generation prompts versioned so you can compare changes and reproduce issues. Include a small curated set of hand-written challenges as a fallback when the local model is unavailable or produces poor output.

## 8. API Design

A possible initial API surface:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/challenges` | List and filter approved challenges |
| `GET` | `/api/challenges/{id}` | Retrieve a challenge |
| `POST` | `/api/challenges/generate` | Request a new generated challenge |
| `POST` | `/api/challenges/{id}/validate` | Validate a draft challenge during development |
| `POST` | `/api/submissions` | Submit a solution for evaluation |
| `GET` | `/api/attempts/{id}` | Retrieve an attempt and its results |
| `GET` | `/api/progress` | Retrieve progress summaries |

Keep generation endpoints separate from submission endpoints. Add request limits and timeouts so a slow local model cannot block the whole application.

## 9. Frontend Layout

A practical challenge workspace can use three main areas:

- **Left panel:** title, difficulty, instructions, requirements, and hints
- **Center panel:** HTML/CSS/JavaScript editor tabs
- **Right or bottom panel:** live preview, test results, and console output

On smaller screens, stack these areas vertically. Keep the preview and editor easy to switch between, and make reset behavior explicit so users do not accidentally lose work.

## 10. Safe Preview and Test Execution

This is one of the most important engineering areas.

- Render user code in a sandboxed iframe, not directly inside the main React application.
- Use a restrictive iframe sandbox configuration and add only the capabilities you specifically need.
- Avoid giving challenge code access to application tokens, local storage, or privileged parent-window functions.
- Do not treat an iframe alone as a complete security boundary for arbitrary hostile code.
- Run automated browser tests in an isolated process or container with timeouts and resource limits.
- Do not execute submitted code on the API server's main process.
- Avoid unrestricted network access from the test environment unless a challenge explicitly requires it.
- Sanitize or safely render generated descriptions and error messages.
- Apply size limits to submitted code and generated challenge payloads.

For an early local-only MVP, begin with iframe-based preview and a carefully constrained test runner. Before exposing the service to other users or the public internet, strengthen process/container isolation and review the threat model.

## 11. Testing Strategy

### Backend tests

- Pydantic rejects malformed challenges.
- Invalid difficulty or mode values are rejected.
- Generation timeouts are handled cleanly.
- Unapproved generated challenges are not published.
- Submission results map correctly to test cases.

### Frontend tests

- Challenge list filters work.
- Editor content updates correctly.
- Preview refreshes when code changes.
- Reset restores starter code.
- Test results show clear pass/fail states.

### End-to-end tests

Use Playwright to verify the full flow:

1. Open a challenge.
2. Modify the solution.
3. Run the preview.
4. Submit the solution.
5. Confirm that the expected tests pass or fail.

Also test malformed output, infinite loops, long-running scripts, and attempts to access the parent application.

## 12. Database Tables to Start With

- `challenges`: metadata, starter code, requirements, mode, difficulty, and approval status
- `test_cases`: test definitions associated with each challenge
- `attempts`: submitted code, timestamps, status, and summary results
- `attempt_test_results`: individual test outcomes and safe diagnostic messages
- `progress`: optional aggregate state by user and challenge

If the first version is single-user and local-only, user accounts can wait. Still use stable challenge IDs and keep challenge versions identifiable so older attempts remain interpretable after a challenge changes.

## 13. Repository Structure

```text
frontend-practice-suite/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── challenges/
│   │   │   ├── editor/
│   │   │   ├── preview/
│   │   │   └── submissions/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── llm_generation.py
│   │   │   ├── challenge_validation.py
│   │   │   └── submissions.py
│   │   └── main.py
│   ├── tests/
│   └── pyproject.toml
├── challenge-library/
├── docs/
└── README.md
```

## 14. Development Roadmap

### Phase 1 — Working editor and preview

- Create the React + Vite application.
- Add the challenge workspace layout.
- Integrate Monaco Editor.
- Implement HTML/CSS/JavaScript editing.
- Render code in the sandboxed preview iframe.
- Add reset and preview refresh controls.

**Milestone:** A user can edit a small page and see the result safely in the preview.

### Phase 2 — Hand-written challenges and grading

- Define the challenge schema.
- Add a small set of hand-written challenges.
- Create FastAPI challenge endpoints.
- Implement submission storage and test result display.
- Add Playwright-based checks in an isolated runner.

**Milestone:** A user can complete a challenge and receive reproducible pass/fail results.

### Phase 3 — Local LLM generation

- Install and configure Ollama with a suitable coding model.
- Build a prompt template for structured challenge generation.
- Add Pydantic validation and bounded repair attempts.
- Smoke-test generated challenges before approval.
- Store approved challenges in the database.

**Milestone:** The platform can generate usable challenges locally while rejecting invalid ones.

### Phase 4 — Progress and quality

- Add attempt history and completion status.
- Add topic and difficulty filters.
- Improve diagnostics and hints.
- Add tests for generation failures and unsafe submissions.
- Improve responsive layout and accessibility.

**Milestone:** The platform is practical for regular personal practice.

### Phase 5 — Advanced challenge types

- Add fix-the-bug and component-building modes.
- Add visual evaluation for page recreation.
- Add optional accounts and synchronization.
- Consider shared challenge packs and deployment.

## 15. Definition of Done for the MVP

The MVP is ready when:

- A user can browse and open a challenge.
- The editor supports HTML, CSS, and JavaScript.
- The preview is isolated from the main app.
- A user can run and reset their code.
- Submission tests produce understandable pass/fail results.
- Generated challenges are validated before becoming available.
- Invalid model output and model timeouts fail gracefully.
- Attempts and results persist locally.
- Automated tests cover the core challenge workflow.

## 16. Recommended First Build Order

Do not start by building the LLM integration. First prove that the core practice loop works with a few hand-written challenges.

1. React + Vite workspace
2. Monaco editor
3. Sandboxed live preview
4. Challenge schema and static challenge files
5. FastAPI challenge endpoints
6. Submission and test-result workflow
7. Isolated Playwright runner
8. Ollama challenge generation
9. Database persistence and progress tracking

This order reduces risk: it separates editor and execution problems from model-generation problems, making failures easier to debug.
