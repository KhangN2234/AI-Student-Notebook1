## Plan: AI Student Notebook MVP + Page Prompts

Build the MVP in three phases: foundation (notes + folders + persistence), AI features (summary + questions), and polish (validation/testing/deploy readiness). Use existing minimal frontend and empty backend as starting points, add a route-based frontend structure, and implement REST APIs that align directly to README user stories. For prompt files, provide development prompts (for Copilot/ChatGPT) per web page so the team can generate each page consistently.

**Steps**
1. Phase 1 - Backend foundation (blocks most other work)
   - Initialize Backend Node project and Express server in existing backend files.
   - Add middleware, env loading, and CORS for frontend dev origin.
   - Implement data layer decision: MongoDB primary, local JSON fallback only if Mongo is unavailable.
   - Implement notes/folders APIs for create/read/list/assign flow from README user stories.
   - Add request validation and consistent error responses.
2. Phase 1 - Frontend architecture (depends on 1 for API contract finalization)
   - Introduce React Router and split current monolithic app into pages/components.
   - Add shared layout/navigation and basic loading/error UX patterns.
   - Add API service module with typed response assumptions and centralized base URL.
3. Phase 1 verification (depends on 1-2)
   - Smoke test notes/folders CRUD from UI against backend.
   - Verify folder assignment and persisted retrieval after refresh.
4. Phase 2 - AI endpoints (depends on 1)
   - Add OpenAI client service in backend and prompt loading utility.
   - Implement summary and questions generation endpoints with stable response shapes.
   - Add backend safeguards: missing API key handling, rate/error fallback messages.
5. Phase 2 - AI pages (depends on 2 and 4)
   - Implement Summary and Questions pages connected to backend endpoints.
   - Add clear loading, retry, and empty-state behavior.
6. Phase 2 verification (depends on 4-5)
   - Validate generated output formatting quality with multiple note sizes.
   - Verify error handling when API key is missing or OpenAI request fails.
7. Phase 3 - hardening and demo readiness (parallel with optional features)
   - Add automated tests (backend route tests + key frontend behavior tests).
   - Add documentation for setup, env vars, and run commands.
   - Triage optional features for post-MVP only.

**Relevant files**
- c:/Users/Stevi/Documents/CS Classes/CS SE Project 4398/student-notebook-llm/README.md — source requirements and user stories to map endpoints/pages.
- c:/Users/Stevi/Documents/CS Classes/CS SE Project 4398/student-notebook-llm/frontend/src/App.jsx — current single-page placeholder to decompose into routed pages.
- c:/Users/Stevi/Documents/CS Classes/CS SE Project 4398/student-notebook-llm/frontend/src/main.jsx — app bootstrap where router/provider wiring is added.
- c:/Users/Stevi/Documents/CS Classes/CS SE Project 4398/student-notebook-llm/Backend/server.js — core server setup and route registration.
- c:/Users/Stevi/Documents/CS Classes/CS SE Project 4398/student-notebook-llm/Backend/package.json — backend dependencies/scripts.
- c:/Users/Stevi/Documents/CS Classes/CS SE Project 4398/student-notebook-llm/AI Student Notebook SRS.pdf — detailed project requirements reference.

**Verification**
1. Run frontend and backend concurrently; verify CORS and successful API calls from browser.
2. Test endpoint contract manually: create note, list notes, create folder, assign note, fetch grouped/filtered views.
3. Test AI flows: generate summary and questions for at least three sample notes (short, medium, long).
4. Confirm persisted data remains available after server restart (based on chosen storage).
5. Run lint/tests (frontend + backend) and record any failing checks before merge.

**Decisions**
- Included scope: MVP user stories in README (notes input, folder organization, summary, questions, saved notes view).
- Excluded from MVP: auth, OCR, calendar, chat, simplified explanations unless schedule permits.
- Prompt deliverable interpreted as development prompts for generating each webpage's code with Copilot/ChatGPT.
- Suggested page set for MVP: Dashboard, Notes Input, Notes List, Note Detail, Folder Manager, Summary View, Questions View.

**Further Considerations**
1. Data storage recommendation: choose MongoDB now to avoid migration churn before demo.
2. API contract recommendation: finalize JSON response schemas before frontend build-out to reduce rework.
3. Prompt usage recommendation: store development prompts in a docs/prompts folder so the team can reuse the same instructions consistently.

## Development Prompt Files (Per Web Page)

### 1) Dashboard Page Prompt
Create a React page component for the AI Student Notebook dashboard using Vite + React Router. Requirements: show app title, quick action cards (New Note, View Notes, Manage Folders), and a recent notes preview list (mock data for now if API unavailable). Add responsive layout for mobile and desktop, simple accessible semantic HTML, and clean CSS module styling. Include loading and empty states for recent notes. Expose the component as default export and wire route path '/'.

### 2) Notes Input Page Prompt
Create a React page for '/notes/new' that supports note entry via textarea and optional file upload placeholder. Include fields: note title, folder selector, note content textarea, Save Note button. Validate required fields (title and content), show inline error messages, and disable submit while saving. Call backend endpoint POST /api/notes with JSON payload {title, content, folderId}. On success, show confirmation and navigate to '/notes'.

### 3) Notes List Page Prompt
Create a React page for '/notes' that fetches notes from GET /api/notes and displays cards with title, folder name, updated timestamp, and preview snippet. Add search by title/content and filter by folder. Include states for loading, empty list, and API error with retry button. Each note card should link to '/notes/:id'. Keep code modular with a NoteCard subcomponent.

### 4) Note Detail Page Prompt
Create a React page for '/notes/:id' that fetches one note from GET /api/notes/:id. Display title, folder, created/updated dates, full content, and action buttons: Generate Summary and Generate Questions. Buttons route to '/notes/:id/summary' and '/notes/:id/questions'. Add robust handling for not-found and network errors.

### 5) Folder Manager Page Prompt
Create a React page for '/folders' with folder CRUD UI and note assignment helper. Fetch folders from GET /api/folders. Provide create folder form, folder list, and count of notes per folder. Add simple assign-note workflow using PATCH /api/notes/:id/folder. Include optimistic UI updates with rollback on API failure.

### 6) Summary View Page Prompt
Create a React page for '/notes/:id/summary'. On load, fetch note details then allow user to generate summary by calling POST /api/summaries with noteId/content. Render summary in structured sections (key ideas, definitions, exam tips). Include regenerate button, loading spinner, and error state with retry.

### 7) Questions View Page Prompt
Create a React page for '/notes/:id/questions'. Generate active recall questions via POST /api/questions using note content. Render numbered questions with optional expandable answers if provided by API. Include 'Generate New Set' button and basic client-side shuffle option. Add loading, empty, and API error states.

### 8) Shared Layout/Nav Prompt
Create a reusable app layout component with top navigation and mobile-friendly menu for routes: '/', '/notes/new', '/notes', '/folders'. Highlight active route, keep consistent spacing/typography, and expose a children slot for pages. Use simple, maintainable CSS and avoid UI libraries.
