**Frontend Acceptance Tests**

- **Purpose:** End-to-end (acceptance) tests that exercise full user workflows in the running frontend app (signup/login, note creation/editing, folder assignment, question generation, review scheduling, validation messages, and protected-route behavior).
- **Tech stack:** Playwright for browser automation (Chromium/Firefox/WebKit). Tests use the Playwright Test runner and run against the local dev server started by the Playwright `webServer` config.
- **Test file:** `src/__tests__/acceptance/app.spec.js` (contains full workflow scenarios).
- **What is tested (high level):**
  - Signup and login flows, redirect to dashboard.
  - Protected routes redirect when unauthenticated.
  - Creating, viewing, editing, and deleting notes.
  - Creating folders and assigning notes to folders (UI flow).
  - Generating active-recall questions and creating review schedules (integration with backend question generation endpoint).
  - Validation messages for login and signup forms.
  - Note detail and questions pages rendering.
- **How tests run:**
  - From the `frontend` folder install deps and run Playwright tests:

```bash
cd frontend
npm install
npx playwright install
npm run test:e2e
```

- **Playwright config:** `playwright.config.js` (testDir: `./src/__tests__/acceptance`, `webServer` runs `npm run dev` to serve the app). Playwright launches the browser and runs tests against the app served at `http://localhost:5173` (default Vite dev port).
- **Backend dependency:** The frontend acceptance tests require the backend API to be available at the API_BASE used by the tests (by default the tests call `http://localhost:4000/api`). Start the backend server before running frontend acceptance tests:

```bash
# from repository root or Backend folder
cd Backend
npm install
npm run dev   # or `node server.js` depending on your start script
```

- **Test user handling:** Tests create unique per-test users via API to avoid shared-state/race conditions. If you see intermittent login/navigation timeouts, ensure the backend is reachable and not rate-limiting/signing up requests too slowly.
- **Common troubleshooting:**
  - Increase Playwright test timeout in `playwright.config.js` if CI is slow.
  - Ensure `npx playwright install` has been run to install browser binaries.
  - Confirm backend is reachable at the configured API base (default: `http://localhost:4000`).
  - If question-generation tests fail, ensure the backend can reach or properly mock external services (tests may mock the external call in the backend).

---

File location: `src/__tests__/acceptance/app.spec.js` (open to inspect scenarios and selectors).
