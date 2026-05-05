# Calendar Feature Implementation Prompts

## Overview
Implement a review scheduling calendar that visualizes when users should revisit generated questions. The calendar displays scheduled review dates, highlights the current day, and allows limited interaction for reviewing questions.

This feature is **frontend-driven (localStorage-based)** for MVP and will later integrate with backend/database for persistence and scalability.

---

## Design Decisions (User-Confirmed)

1. **LocalStorage MVP:** Review schedule is stored in localStorage under `reviewSchedule`.
2. **Date Format:** Keys use `YYYY-MM-DD` format for consistency.
3. **Month View Only:** Calendar displays one month at a time.
4. **Navigation:** Users can move between months using `<` and `>` buttons.
5. **Highlighting:**
   - Current day is visually distinct
   - Days with reviews are highlighted
6. **Click Behavior:**
   - Only **current day with scheduled questions** is clickable
   - Future days are visible but disabled ("available later")
7. **No Backend Yet:** Questions are NOT fetched per day yet — placeholder behavior only.
8. **No Past Restriction:** Past days remain visible but not interactive for now.

---

## Phase 1: Calendar Rendering

### Prompt 1.1: Monthly Grid Layout
Create a React calendar view that:
- Displays current month and year
- Uses a 7-column grid (Sun–Sat)
- Calculates:
  - First day of month
  - Number of days in month
- Fills leading empty cells for alignment

Each day cell:
- Displays day number
- Displays question count if present

---

### Prompt 1.2: Load Schedule Data
- Load schedule from localStorage:
  ```js
  localStorage.getItem('reviewSchedule')
  ```
- Parse JSON into object
- Map schedule data into calendar cells

---

## Phase 2: Visual Feedback

### Prompt 2.1: Highlight States
Apply visual styles:
- Default → white background
- Has questions → light blue
- Current day → darker blue
- Future scheduled → faded opacity

---

### Prompt 2.2: Question Label
Display text inside cells:
- Format:
  - Today → `X questions`
  - Future → `X questions (available later)`

- Styling:
  - Today → bold + underline + clickable color
  - Future → reduced opacity

---

## Phase 3: Interaction

### Prompt 3.1: Click Behavior (MVP)
- Only allow clicking if:
  - `item.count > 0`
  - `item.dateKey === todayKey`

- On click:
  ```js
  alert(`Review ${item.count} questions`)
  ```

- Future days:
  - No click action
  - Cursor: default

---

### Prompt 3.2: Cursor + UX Feedback
- Today with questions → `cursor: pointer`
- Future days → `cursor: default`
- Make clickable text visually obvious

---

## Phase 4: Month Navigation

### Prompt 4.1: State Management
Add:
```js
const [currentDate, setCurrentDate] = useState(new Date());
```

---

### Prompt 4.2: Navigation Controls
Add buttons:
- `<` → previous month
- `>` → next month

Update state:
```js
setCurrentDate(new Date(year, month - 1));
setCurrentDate(new Date(year, month + 1));
```

---

### Prompt 4.3: Dynamic Calendar Rendering
- Replace static `new Date()` usage
- Use `currentDate` for:
  - year
  - month
  - display header

---

## Phase 5: Integration Hooks (Future)

### Prompt 5.1: Backend Integration (Future)
Prepare for:
- Fetching schedule from backend instead of localStorage
- Storing:
  - question IDs
  - note IDs
  - spaced repetition intervals

---

### Prompt 5.2: Review Session Navigation (Future)
Replace alert with:
- Navigation to:
  ```
  /review/:date
  ```
- Load questions for selected day

---

## Phase 6: Testing & Validation

### Prompt 6.1: Calendar Workflow Test
1. Schedule data exists in localStorage
2. Calendar renders correct month layout
3. Dates align correctly with weekdays
4. Days with questions are highlighted
5. Current day styling updates correctly
6. Clicking today's questions triggers action
7. Future days are not clickable
8. Month navigation updates view correctly

---

## Implementation Notes

- Keep logic simple — no over-engineering
- Do not integrate backend yet
- Avoid complex date libraries (use native JS)
- Focus on clarity and UX feedback
- This is a visual + interaction MVP feature

---

## Status

✔ Calendar UI implemented  
✔ Month navigation implemented  
✔ Click logic (today-only) implemented  
✔ LocalStorage integration working  

Future work:
- Backend persistence
- Question retrieval per day
- Spaced repetition algorithm