# Quick Test Reference

## Get Started (First Time)

```bash
# Install dependencies
cd frontend
npm install
```

## Frontend Unit Tests (Vitest)

### Run all tests (watch mode)
```bash
cd frontend
npm test
```

### Run tests once
```bash
npm run test:run
```

### Run with interactive UI
```bash
npm run test:ui
```

### See coverage report
```bash
npm run test:coverage
```

## 🌐 Frontend Acceptance Tests (Playwright)

### Prerequisites
1. Backend running on `http://localhost:4000`:
   ```bash
   cd Backend
   npm run start
   ```

2. Then in frontend directory:
   ```bash
   npm run test:e2e
   ```

### See browser during test
```bash
npx playwright test --headed
```

### Debug mode (interactive)
```bash
npx playwright test --debug
```

### View test report
```bash
npx playwright show-report
```

## ✅ Backend Acceptance Tests (Jest)

```bash
cd Backend
npm test                          # Run all tests
npx jest --runInBand acceptance  # Run acceptance suite only
```

---

## Common Commands

| Task | Command |
|------|---------|
| Run all unit tests | `cd frontend && npm test` |
| Run tests once | `npm run test:run` |
| See test UI | `npm run test:ui` |
| Run E2E tests | `npm run test:e2e` |
| Generate coverage | `npm run test:coverage` |
| Debug E2E test | `npx playwright test --debug` |
| View E2E report | `npx playwright show-report` |

---

## Test File Locations

```
Frontend Unit Tests:
├── src/__tests__/unit/components/
│   ├── NoteCard.test.jsx
│   ├── FolderItem.test.jsx
│   └── FoldersSidebar.test.jsx
├── src/__tests__/unit/pages/
│   ├── LoginPage.test.jsx
│   └── SignupPage.test.jsx
└── src/__tests__/unit/services/
    ├── api.test.js
    └── auth.test.js

Frontend Acceptance Tests:
└── src/__tests__/acceptance/app.spec.js

Backend Acceptance Tests:
└── Backend/tests/acceptance.test.js


---

## Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### "Backend is unreachable" (acceptance tests)
```bash
# Make sure backend is running
cd Backend
npm run start
# Then run tests in another terminal
```

### Tests hanging
- For unit tests: Press Ctrl+C and try `npm run test:run`
- For E2E tests: Check browser is not blocked, try `npm run test:e2e`

### See what's happening
```bash
npm run test:ui          # For unit tests
npx playwright test --headed  # For E2E tests
```
