# Progress Tracking Feature Implementation Prompts

## Overview
Implement a progress tracking system that visualizes a user’s performance over time based on active recall sessions. This feature builds directly on the existing Questions (Active Recall) workflow and allows users to understand trends in their learning, including improvement or decline across sessions.

This feature is part of the frontend MVP and uses locally stored data, but must be structured so that it can later integrate with backend/database storage without major refactoring.

---

## Existing Layout Structure

The application uses `frontend/src/components/AppLayout.jsx` with the following structure:

- `.sidebar-top` → Branding (DO NOT MODIFY)
- `.sidebar-middle` → Folder/navigation system (DO NOT MODIFY)
- `.sidebar-bottom` → Main navigation links
- `.content-area` → Main page rendering area (THIS is where ProgressTrackingPage must render)

### Key Constraints
- ProgressTrackingPage must render inside `.content-area`
- Do NOT modify AppLayout.jsx structure
- Do NOT break existing sidebar behavior
- Must follow layout and styling conventions used in:
  - `QuestionsPage.jsx`
  - `Dashboard` (if present)
  - Other existing pages

---

## Design Decisions (User-Confirmed)

1. **Session-Based Tracking**
- Each "Submit Answers" action in QuestionsPage represents one session
- Each session is recorded as a single entry

2. **Data Captured Per Session**
Each session must include:
- Date of session
- Number of correct answers
- Number of partially correct answers
- Number of incorrect or missing answers

3. **Data Storage (MVP)**
- Stored in browser using localStorage under key `reviewStats`
- No backend/database integration at this stage
- Data structure must remain simple and consistent for future migration

4. **Visualization Requirements**
- Display a line chart showing trends over time
- Include three tracked metrics:
  - Correct answers
  - Partial answers
  - Incorrect answers

5. **User Clarity Requirements**
- Must include clear labels and headings
- Must include a legend explaining chart lines
- Must not rely solely on color to communicate meaning

6. **Scope Constraints (MVP)**
- No filtering options
- No per-question analytics
- No per-note breakdown
- No advanced statistics or AI analysis

7. **Future Compatibility**
- Logic must be easy to move to backend later
- Avoid tightly coupling logic to localStorage
- Keep data structure consistent and predictable

---

## Phase 1: Data Tracking Integration (QuestionsPage)

### Prompt 1.1: Extend QuestionsPage Submission Logic

File:
`frontend/src/pages/QuestionsPage.jsx`

Enhance the existing answer submission flow:

Requirements:
- After grading answers, compute:
  - Total correct answers
  - Total partially correct answers
  - Total incorrect/missing answers
- Create a session object containing:
  - Current date
  - Correct count
  - Partial count
  - Incorrect count
- Append this session to stored data (do NOT overwrite existing data)

Key Behaviors:
- Each submission creates exactly one session entry
- Data persists across refresh
- No duplicate or overwritten sessions

---

### Prompt 1.2: Handle Storage Safety

Within QuestionsPage:

Requirements:
- Safely read from localStorage
- Handle missing or malformed data
- Default to an empty dataset when necessary
- Ensure no crashes occur due to bad data

---

## Phase 2: Progress Tracking Page Creation

### Prompt 2.1: Create ProgressTrackingPage Component

Create:
`frontend/src/pages/ProgressTrackingPage.jsx`

Requirements:
- Must follow same structure as other page components
- Must integrate with AppLayout
- Must be styled consistently with existing pages

Page Layout Order:
1. Page title ("Progress Tracking")
2. Summary section (totals)
3. Chart section
4. Legend
5. Insights section

---

### Prompt 2.2: Load Stored Data

Inside ProgressTrackingPage:

Requirements:
- Load session data from localStorage on page load
- Store data in component state
- Handle empty dataset gracefully

Empty State Behavior:
- Display message indicating no data exists yet
- Do not render chart when no data is present

---

## Phase 3: Chart Visualization

### Prompt 3.1: Integrate Chart Library

Use a lightweight charting library (e.g., Recharts).

Requirements:
- Chart must render inside ProgressTrackingPage
- Must fit within responsive layout constraints
- Must not break existing CSS

---

### Prompt 3.2: Configure Line Chart

Chart Requirements:
- X-axis → session date
- Y-axis → answer counts

Include three lines:
- Correct answers
- Partial answers
- Incorrect answers

Behavior:
- Chart updates automatically when new sessions are added
- Dates must be readable and properly formatted
- Chart must be responsive

---

## Phase 4: Summary Section

### Prompt 4.1: Compute Aggregate Totals

Within ProgressTrackingPage:

Requirements:
- Calculate totals across all sessions:
  - Total correct answers
  - Total partial answers
  - Total incorrect answers

---

### Prompt 4.2: Display Summary

Requirements:
- Display totals clearly at top of page
- Ensure readability and clean layout
- Must match styling of other content sections

---

## Phase 5: Legend and UX Clarity

### Prompt 5.1: Add Legend

Requirements:
- Clearly describe what each line represents:
  - Correct
  - Partial
  - Incorrect
- Place legend near chart

---

### Prompt 5.2: Improve Readability

Requirements:
- Use clear labels and spacing
- Avoid relying only on color
- Ensure accessibility and clarity

---

## Phase 6: Insights Section

### Prompt 6.1: Last Session Summary

Requirements:
- Display most recent session data:
  - Correct
  - Partial
  - Incorrect
- Must be clearly separated from totals

---

### Prompt 6.2: Improvement Indicator

Requirements:
- Compare most recent session with previous session
- If correct answers increased → show improvement message
- If incorrect answers increased → show review-needed message
- If only one session exists → do not show comparison

---

## Phase 7: Routing Integration

### Prompt 7.1: Add Route

File:
`frontend/src/App.jsx`

Requirements:
- Add route for `/progress`
- Route must render ProgressTrackingPage
- Must be wrapped in AppLayout

---

### Prompt 7.2: Add Navigation Link

File:
`frontend/src/components/AppLayout.jsx`

Requirements:
- Add new navigation item:
  - Label: "Progress"
  - Route: `/progress`
- Must match styling of existing navigation links
- Must not break sidebar layout

---

## Phase 8: Testing and Validation

### Prompt 8.1: End-to-End Workflow Test

Validate the following:

1. Complete a Questions session
2. Submit answers
3. Verify session data is stored
4. Navigate to `/progress`
5. Verify chart renders correctly
6. Verify totals are accurate
7. Verify insights display correctly
8. Verify empty state behavior (no data)
9. Verify page does not break layout

---

## Implementation Notes

- Keep UI simple and consistent
- Do not over-engineer
- Maintain separation of concerns:
  - QuestionsPage handles session creation
  - ProgressTrackingPage handles visualization
- Prepare structure for future backend integration

---

## Status

✔ Integrated with Active Recall  
✔ Session tracking implemented  
✔ Progress visualization added  

---

## Future Work

- Move session storage to backend/database
- Add per-note tracking
- Add filtering and advanced analytics
- Integrate with spaced repetition system
# Progress Tracking Feature Implementation Prompts

## Overview
Implement a progress tracking system that visualizes a user’s performance over time based on active recall sessions. This feature builds directly on the existing Questions (Active Recall) workflow and allows users to understand trends in their learning, including improvement or decline across sessions.

This feature is part of the frontend MVP and uses locally stored data, but is structured so that it can later integrate with backend/database storage without major refactoring.

---

## Existing Layout Structure

The application uses `frontend/src/components/AppLayout.jsx` with the following structure:

- `.sidebar-top` → Branding (DO NOT MODIFY)
- `.sidebar-middle` → Folder/navigation system (DO NOT MODIFY)
- `.sidebar-bottom` → Main navigation links
- `.content-area` → Main page rendering area (THIS is where ProgressTrackingPage must render)

### Key Constraints
- ProgressTrackingPage must render inside `.content-area`
- Do NOT modify AppLayout.jsx structure
- Do NOT break existing sidebar behavior
- Must follow layout and styling conventions used in:
  - `QuestionsPage.jsx`
  - `DashboardPage.jsx`
  - Other existing pages

---

## Final Implemented Design (IMPORTANT)

### 1. Session-Based Tracking
- Each "Submit Answers" action = ONE session
- A session is only recorded AFTER submission (not during answering)
- Submit button disappears after submission to prevent duplicate sessions

### 2. Data Captured Per Session
Each session stores:
- `date` (YYYY-MM-DD format)
- `correct`
- `partial`
- `incorrect`

Example:
```
{
  date: "2026-05-09",
  correct: 2,
  partial: 1,
  incorrect: 3
}
```

### 3. Data Storage (Current Implementation)
- Stored in `localStorage` under key: `reviewStats`
- Appends new sessions (does NOT overwrite)
- Includes safe parsing + fallback handling

---

## Phase 1: QuestionsPage Integration (COMPLETED)

File:
`frontend/src/pages/QuestionsPage.jsx`

### Implemented Behavior
- Grades answers into: correct / partial / incorrect
- Calculates totals per submission
- Creates a session object
- Appends to localStorage

### Critical Logic
- Safe JSON parsing
- Appending (not replacing)
- Logging for debugging
- Submit button disappears after submission (`results.length > 0`)

### Additional Behavior
- Schedule generation still runs (unchanged)
- Progress tracking is independent of scheduling

---

## Phase 2: ProgressTrackingPage (COMPLETED)

File:
`frontend/src/pages/ProgressTrackingPage.jsx`

### Data Handling
- Loads from `localStorage.reviewStats`
- Safely parses data
- Normalizes values (ensures numbers)
- Sorts by date ascending

---

## Phase 3: Visualization (COMPLETED)

### Chart Library
- Recharts is used

### Chart Configuration
- X-axis: date
- Y-axis: counts
- Three lines:
  - correct (green)
  - partial (orange)
  - incorrect (red)

### Behavior
- Updates automatically when new sessions are added
- Responsive container used

---

## Phase 4: UI Layout (UPDATED TO MATCH FINAL BUILD)

### FINAL PAGE STRUCTURE

1. **Title**
   - "Progress Tracking"

2. **Summary Cards (Top Row)**
   - 3 cards:
     - Correct
     - Partial
     - Incorrect
   - Horizontal layout using grid

3. **Chart Card**
   - Full-width card
   - Contains line chart

4. **Lower Section (Split Layout)**
   - Left: Legend (1/3 width)
   - Right: Last Session (2/3 width)

5. **Insight Section (Full Width)**

---

## Phase 5: Legend (UPDATED)

### Final Behavior
- Uses colored dots + labels
- NOT duplicated (removed Recharts legend duplication issue)

### Layout
- Left-aligned
- Vertically centered within its card
- Smaller than other cards

---

## Phase 6: Last Session Section (COMPLETED)

Displays:
- Date
- Correct
- Partial
- Incorrect

Layout:
- Larger card (2/3 width)
- Sits beside legend

---

## Phase 7: Insight Section (COMPLETED)

### Logic
- Compares last session vs previous session

Rules:
- More correct → "Improved"
- More incorrect → "Needs review"
- Otherwise → "Consistent"
- Only shown if at least 2 sessions exist

---

## Phase 8: Routing (COMPLETED)

### App.jsx
- Route added:
```
/progress
```

### AppLayout.jsx
- Navigation link added:
- "Progress"

---

## Phase 9: Styling (IMPORTANT FINAL STATE)

### Key Improvements Made
- Card-based layout (consistent with dashboard)
- Grid-based layout for responsiveness
- Summary cards aligned horizontally
- Chart placed inside its own card
- Legend + Last Session split 1/3 vs 2/3
- Vertical centering of legend items

---

## Known Limitations (Intentional for MVP)

- Uses localStorage instead of backend
- No user authentication linkage yet
- No filtering or per-note breakdown
- No persistence across devices

---

## Status

✔ Integrated with Active Recall  
✔ Session tracking implemented  
✔ Chart visualization implemented  
✔ UI layout finalized  
✔ Routing integrated  
✔ UX improvements applied  

---

## Future Work

- Move storage to backend (Mongo)
- Tie sessions to authenticated user
- Add per-note tracking
- Add filtering (date range, note, etc.)
- Improve analytics (averages, trends, AI insights)
- Integrate with spaced repetition system

---

## IMPORTANT DEVELOPMENT RULE (FOR ALL FUTURE FEATURES)

- Always follow **consistent layout patterns (cards + grid)**
- Always separate:
  - Data logic (QuestionsPage)
  - Visualization (ProgressTrackingPage)
- Always design for **future backend integration**
- Avoid tightly coupling logic to localStorage
- Maintain clean, predictable data structures
