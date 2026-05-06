# Progress Tracking Feature Implementation Prompts

## Overview
Implement a progress tracking system that visualizes a user’s performance over time based on active recall sessions. The feature displays trends for correct, partially correct, and incorrect answers using a line chart, along with summary statistics and simple performance insights.

This feature is **frontend-only (localStorage-based)** for MVP and integrates directly with the existing Active Recall (Questions) workflow.

---

## Existing Layout Structure
The app uses `AppLayout.jsx` with:
- `.sidebar-top` → branding
- `.sidebar-middle` → folders/notes navigation
- `.sidebar-bottom` → main navigation
- `.content-area` → main page content

**Constraint:**
- ProgressTrackingPage must render inside `.content-area`
- Do NOT modify AppLayout structure
- Must follow same page layout conventions as existing pages (Dashboard, QuestionsPage, etc.)

---

## Design Decisions (User-Confirmed)

1. **LocalStorage-Based Tracking**
   - Data stored under `reviewStats`
   - No backend/database for MVP

2. **Session-Based Logging**
   - Each "Submit Answers" action creates one entry
   - Data includes:
     - date
     - correct count
     - partial count
     - incorrect count

3. **Flat Data Model**
```json
[
  {
    "date": "2026-05-05",
    "correct": 3,
    "partial": 1,
    "incorrect": 2
  }
]
```

4. **Visualization Requirements**
   - Line chart with:
     - Correct (green)
     - Partial (yellow/orange)
     - Incorrect (red)

5. **User Clarity**
   - Must include legend explaining chart
   - Must include totals summary

6. **Interaction Simplicity**
   - No filtering
   - No drill-down views
   - No per-question analytics

7. **Lightweight Insights**
   - Last session summary
   - Basic improvement indicator

---

## Phase 1: Data Tracking Integration

### Prompt 1.1: Hook Into QuestionsPage
Update `frontend/src/pages/QuestionsPage.jsx`:

After grading answers:
- Count:
  - correct
  - partial
  - incorrect

Store session:

```js
const stats = JSON.parse(localStorage.getItem('reviewStats')) || [];

stats.push({
  date: todayKey,
  correct: correctCount,
  partial: partialCount,
  incorrect: incorrectCount
});

localStorage.setItem('reviewStats', JSON.stringify(stats));
```

---

### Prompt 1.2: Ensure Consistent Date Format
- Use `YYYY-MM-DD`
- Reuse existing `todayKey` logic from calendar feature

---

## Phase 2: Progress Tracking Page

### Prompt 2.1: Create Page Component
Create:

`frontend/src/pages/ProgressTrackingPage.jsx`

Requirements:
- Title: "Progress Tracking"
- Consistent styling with other pages
- Layout order:
  1. Title
  2. Totals summary
  3. Chart
  4. Legend
  5. Insights

---

### Prompt 2.2: Load Data
- Retrieve stats from localStorage
- Parse JSON safely
- Handle empty state:
  - Show: "No review data yet"

---

## Phase 3: Chart Visualization

### Prompt 3.1: Install Recharts
```bash
npm install recharts
```

---

### Prompt 3.2: Build Line Chart
Render chart with:

- X-axis → date
- Y-axis → counts

```jsx
<LineChart data={data}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line dataKey="correct" stroke="green" />
  <Line dataKey="partial" stroke="orange" />
  <Line dataKey="incorrect" stroke="red" />
</LineChart>
```

---

### Prompt 3.3: Chart Behavior
- Must update dynamically when new sessions are added
- Dates should display in readable format if possible

---

## Phase 4: Totals Summary

### Prompt 4.1: Compute Totals
- Sum all sessions:
  - correct
  - partial
  - incorrect

---

### Prompt 4.2: Display Totals
Display clearly at top:
- Total Correct
- Total Partial
- Total Incorrect

---

## Phase 5: Legend & UX Clarity

### Prompt 5.1: Add Legend
Display:

- Green → Correct
- Yellow → Partial
- Red → Incorrect

---

### Prompt 5.2: UX Feedback
Ensure:
- Clear labels
- Readable layout
- No reliance on color alone

---

## Phase 6: Insights (Lightweight)

### Prompt 6.1: Last Session
Display:

- Most recent session stats

---

### Prompt 6.2: Improvement Indicator
Compare last two sessions:
- More correct → "You improved"
- More incorrect → "Needs review"

---

## Phase 7: Routing Integration

### Prompt 7.1: Add Route
In `App.jsx`:

```
/progress
```

---

### Prompt 7.2: Add Navigation Link
Add to sidebar:
- Label: "Progress"
- Route: `/progress`

---

## Phase 8: Testing & Validation

### Prompt 8.1: Workflow Test
1. Complete questions session
2. Submit answers
3. Verify stats saved
4. Navigate to `/progress`
5. Chart renders correctly
6. Totals correct
7. Insights display properly

---

## Implementation Notes

- Keep UI simple
- No backend integration
- No advanced analytics
- Focus on usability and clarity
- This is an MVP feature

---

## Status

✔ Integrated with active recall  
✔ LocalStorage persistence  
✔ Visual progress tracking  

Future:
- Backend storage
- Per-note tracking
- Spaced repetition integration