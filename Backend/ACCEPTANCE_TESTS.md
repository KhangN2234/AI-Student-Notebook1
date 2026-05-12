**Backend Acceptance / Integration Tests**

- **Purpose:** API-level acceptance/integration tests that verify the backend HTTP API behavior and core workflows (auth, folders/notes CRUD, question-generation integration, review schedule and session management, and protected-route enforcement).
- **Tech stack:** Jest + Supertest for HTTP testing; tests use an in-memory MongoDB for isolation (mongodb-memory-server) and mock external HTTP calls (e.g., `axios` is mocked for question generation).
- **Test file:** `tests/acceptance.test.js` (contains the integrated acceptance tests covering end-to-end backend flows).
- **What is tested (high level):**
  - Health check (`GET /api/health`).
  - User signup, login, and `GET /api/auth/me` profile retrieval.
  - Protected route enforcement for `/api/notes`, `/api/folders`, `/api/reviews`, `/api/schedule`.
  - Folder creation and listing, note creation/listing/get/update/delete, and ensuring folder/notes stay scoped to the authenticated user.
  - Question generation endpoint (`POST /api/questions`) — external AI/generation calls are mocked with `axios` in tests.
  - Review schedule generation (`POST /api/schedule`) and review session creation/listing/clearing (`/api/reviews`).
  - Clearing review history and schedule (`DELETE /api/reviews`, `DELETE /api/schedule`).
- **How tests run:**
  - From the `Backend` folder install deps and run tests:

```bash
cd Backend
npm install
npm test
```

Or run Jest directly for verbose output:

```bash
npx jest --runInBand --colors
```

- **Test helpers and notes:**
  - Tests use helper functions in `tests/mongoTestHelper` (or equivalent) to start a temporary in-memory MongoDB and to clear/teardown the DB between tests.
  - `axios` is mocked at the top of the acceptance test file to control responses from question-generation services so tests are deterministic.
  - Environment variables used by the tests (e.g., `GROQ_API_KEY`) are set in the test setup; if your CI requires explicit values, provide them before running tests.

- **Common troubleshooting:**
  - If MongoDB memory server fails to start, ensure system has required native build tools or use a supported Node.js version.
  - If external API calls are failing in tests, confirm the mocks are active (tests mock `axios.post` by default in acceptance.test.js).
  - Run tests with `--runInBand` to avoid resource contention on CI.

---

File location: `Backend/tests/acceptance.test.js` (open to inspect the scenarios and helper usage).
