# MongoDB Integration Prompts for Calendar and Progress Tracking

Use the prompts below with Copilot, ChatGPT, or another coding assistant to migrate the calendar and progress tracking features from `localStorage` to MongoDB while preserving the current UI behavior.

## Current App Context

- `QuestionsPage.jsx` currently writes review results into `localStorage.reviewStats`.
- `CalendarPage.jsx` currently reads `localStorage.reviewSchedule`.
- `ProgressTrackingPage.jsx` currently reads `localStorage.reviewStats`.
- Same-day review sessions now store:
  - `date`
  - `sessionNumber`
  - `sessionLabel`
  - `correct`
  - `partial`
  - `incorrect`
- The app already uses MongoDB elsewhere for notes, folders, and auth.
- Auth is already available, so calendar and progress data should be scoped by user.

## Recommended MongoDB Data Model

Before coding, decide whether to use:

1. A single `ReviewSession` collection for progress and calendar data, or
2. Separate collections for `ReviewSession` and `ReviewSchedule`.

A good starting point is:

- `ReviewSession`
  - `userId`
  - `noteId` or `sourceNoteId` if the session belongs to a note
  - `dateKey` in `YYYY-MM-DD` format
  - `sessionNumber`
  - `sessionLabel`
  - `correct`
  - `partial`
  - `incorrect`
  - `createdAt`, `updatedAt`
- `ReviewSchedule`
  - `userId`
  - `dateKey`
  - `scheduledCount`
  - `items` or `questionIds` if needed
  - `createdAt`, `updatedAt`

If the calendar is generated from review results, you may not need a separate `ReviewSchedule` collection at all. In that case, derive the calendar from `ReviewSession` records.

## Prompt 1: Assess the Current Data Flow

Use this prompt first to inspect the app and decide the migration path:

```text
Review the current frontend and backend implementation for the calendar and progress tracking features.

Focus on these files and behaviors:
- frontend/src/pages/CalendarPage.jsx
- frontend/src/pages/ProgressTrackingPage.jsx
- frontend/src/pages/QuestionsPage.jsx
- any backend routes, models, or repositories that already exist for notes, folders, and auth

Identify:
1. Where calendar data is currently stored and read from
2. Where progress data is currently stored and read from
3. The exact shape of the data being written for same-day sessions
4. The smallest MongoDB data model needed to replace localStorage without breaking the UI
5. Any code paths that should remain unchanged

Return a concise implementation plan with file-by-file changes.
```

## Prompt 2: Design the MongoDB Schema

Use this prompt to generate the database model and repository layer:

```text
Design the MongoDB schema and repository layer for review sessions and calendar scheduling.

Requirements:
- Scope all data by authenticated user
- Preserve same-day session numbering and labels
- Support progress chart queries by date range or by all sessions
- Support calendar rendering for each month
- Keep the schema minimal and practical
- Use Mongoose if the app is already using Mongoose

Please provide:
1. The Mongoose model(s)
2. Any indexes that would help query performance
3. Repository functions needed for create, list, and delete operations
4. How duplicate dates should be handled so multiple sessions on the same date remain distinct
5. Example document shapes

Do not write frontend code yet.
```

## Prompt 3: Migrate Progress Tracking to MongoDB

Use this prompt to replace `localStorage.reviewStats` with backend data:

```text
Migrate the progress tracking feature from localStorage to MongoDB.

Current behavior:
- ProgressTrackingPage reads reviewStats from localStorage
- QuestionsPage writes reviewStats into localStorage after each completed session
- The progress page displays totals, a line chart, a custom tooltip, and a clear-all button

Requirements:
- Store and load progress data from MongoDB instead of localStorage
- Keep the existing chart UI and tooltip behavior
- Preserve same-day session labels such as Session 1, Session 2, etc.
- Scope all records by the current authenticated user
- Keep a clear-all action that removes only the current user’s progress records
- Keep the frontend responsive and the current styling intact

Implementation guidance:
- Add or update API endpoints for creating, listing, and deleting review sessions
- Replace localStorage reads with API fetches in ProgressTrackingPage
- Replace localStorage writes in QuestionsPage with API writes
- Keep the X-axis labels stable and readable
- Ensure the tooltip shows the exact values for the hovered session

After implementing, also provide a short verification checklist.
```

## Prompt 4: Migrate Calendar Scheduling to MongoDB

Use this prompt to replace `localStorage.reviewSchedule` with backend data:

```text
Migrate the calendar feature from localStorage to MongoDB.

Current behavior:
- CalendarPage reads reviewSchedule from localStorage
- The calendar shows a month view, weekday headers, and per-day counts
- Clicking a due item on the current date triggers the review interaction

Requirements:
- Store and load calendar schedule data from MongoDB instead of localStorage
- Keep the current month navigation and UI intact
- Scope schedule records by authenticated user
- Preserve the current virtual behavior for dates with no reviews
- Support multiple review sessions on the same date if needed
- Ensure the calendar remains fast to render for a month view

Implementation guidance:
- Add or update API endpoints for calendar schedule data
- Replace localStorage reads in CalendarPage with API fetches
- Update the question-generation flow so it saves schedule data server-side after generating questions
- Keep the same existing date-key format if possible to reduce frontend changes
- If schedule generation can be derived from review sessions, explain that option clearly and recommend the simpler path

After implementing, provide the changed files and any migration notes.
```

## Prompt 5: Wire Questions Generation to MongoDB

Use this prompt if you want the session writer to save progress and schedule data server-side:

```text
Update the question-generation flow so it stores review progress and calendar schedule data in MongoDB.

Current behavior:
- QuestionsPage generates questions and stores progress in localStorage.reviewStats
- QuestionsPage stores generated calendar data in localStorage.reviewSchedule
- Same-day sessions need sessionNumber and sessionLabel values

Requirements:
- Save review sessions to MongoDB
- Save generated schedule data to MongoDB or derive it from session data, depending on the chosen design
- Preserve same-day session numbering and labels
- Keep the frontend behavior the same from the user’s perspective
- Make the data user-specific using the authenticated user ID

Please update:
1. The question completion save flow
2. Any API utilities used by the frontend
3. Any backend route or repository functions needed for persistence
4. Any error handling for failed saves

Return the exact API contract for the frontend after the change.
```

## Prompt 6: Clear-All and Cleanup Prompt

Use this prompt to add deletion support after migration:

```text
Implement deletion support for calendar and progress tracking data in MongoDB.

Requirements:
- The existing Clear all button in ProgressTrackingPage should delete only the current user’s review session records
- If calendar schedule data is stored separately, clear only the current user’s schedule records
- Do not delete notes, folders, or unrelated user data
- Keep the confirmation dialog behavior in the UI
- Return updated empty states when there is no data

Please include:
1. The backend delete endpoint(s)
2. Repository functions
3. Frontend updates if any are needed
4. A short explanation of how user scoping is enforced
```

## Prompt 7: Verification Prompt

Use this prompt to test the migration end to end:

```text
Verify the MongoDB migration for the calendar and progress tracking features.

Test these scenarios:
- Creating a new review session stores the data in MongoDB
- Same-day sessions get unique session numbers and labels
- ProgressTrackingPage loads data from MongoDB and renders the chart correctly
- CalendarPage loads schedule data from MongoDB and renders the month correctly
- Clear all removes only the current user’s review data
- Two different users cannot see each other’s review or calendar data

Please provide:
1. A list of tests or checks to run
2. Any edge cases to verify manually
3. Any bugs or risks left after the migration
```

## Suggested Migration Order

1. Decide whether calendar data should be stored separately or derived from review sessions.
2. Add MongoDB models and repositories.
3. Add backend routes for review sessions and schedule data.
4. Update `QuestionsPage.jsx` to write through the API.
5. Update `ProgressTrackingPage.jsx` to read from the API.
6. Update `CalendarPage.jsx` to read from the API.
7. Add or update delete endpoints for clear-all behavior.
8. Test same-day session labeling, chart tooltips, and month navigation.

## Notes for the Assistant

- Do not break the current UI or styling while migrating the data layer.
- Keep the user experience the same unless the change is strictly necessary for MongoDB.
- Prefer small, incremental steps over a full rewrite.
- If a design choice is ambiguous, ask which model the user wants before changing the code.
