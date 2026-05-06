# Calendar Feature Implementation Prompts

## Overview
Implement a calendar-based review scheduling system that allows users to visualize when they should revisit generated questions. The calendar integrates with the existing active recall system and displays scheduled review dates with limited interaction for MVP.

---

## Existing Layout Structure
The app already uses a sidebar layout defined in `frontend/src/components/AppLayout.jsx`:

- `.sidebar-top` - Logo and app title — **DO NOT MODIFY**
- `.sidebar-middle` - Folder/navigation content — **DO NOT MODIFY STRUCTURE**
- `.sidebar-bottom` - Main navigation (Dashboard, etc.)
- `.content-area` - Main page content via `<Outlet />` — **CalendarPage renders here**

**Key constraint:** Calendar must render inside `.content-area` and preserve existing sidebar behavior.

---

## Design Decisions (User-Confirmed)

1. **LocalStorage Persistence:** Review schedule is stored under `reviewSchedule`
2. **Date Format:** `YYYY-MM-DD`
3. **Flat Monthly View:** Only one month displayed at a time
4. **Navigation Controls:** Users can move between months
5. **Limited Interaction (MVP):**
   - Only today's scheduled reviews are clickable
   - Future dates are locked
6. **Visual Feedback Priority:** Users must clearly see:
   - Which days have reviews
   - Which day is today
7. **No Backend Yet:** Schedule is not persisted server-side
8. **Future Compatibility:** Must support database + spaced repetition later

---

## Phase 1: Page Setup

### Prompt 1.1: Create CalendarPage Component (Single-Shot)
Create `frontend/src/pages/CalendarPage.jsx` that:
- Displays title "Review Calendar"
- Renders inside existing layout (`AppLayout`)
- Exports as default component
- Will be registered to route `/calendar`

---

### Prompt 1.2: Add Route to App.jsx (Single-Shot)
Update routing in `frontend/src/App.jsx`:
- Add:
  - `<Route path="/calendar" element={<CalendarPage />} />`
- Ensure navigation works correctly

---

### Prompt 1.3: Add Navigation Link (Single-Shot)
Update sidebar navigation in `AppLayout.jsx`:
- Add "Calendar" under Dashboard
- Ensure consistent styling with existing nav items
- Clicking navigates to `/calendar`

---

## Phase 2: Data Integration

### Prompt 2.1: Load Schedule Data (Single-Shot)
Inside `CalendarPage.jsx`:
- Retrieve schedule from localStorage:
```js
localStorage.getItem('reviewSchedule')
```
- Parse JSON
- Store in React state

---

### Prompt 2.2: Schedule Structure Handling
Ensure schedule follows format:
```js
{
  "YYYY-MM-DD": numberOfQuestions
}
```

- Safely handle missing or empty data
- Default to empty object if null

---

## Phase 3: Calendar Grid Implementation

### Prompt 3.1: Monthly Grid Layout (Single-Shot)
Render a 7-column grid (Sunday → Saturday):
- Calculate:
  - First day of month
  - Days in month
- Fill leading empty cells for alignment

---

### Prompt 3.2: Map Dates to Cells
For each day:
- Generate dateKey in `YYYY-MM-DD`
- Lookup schedule:
```js
schedule[dateKey]
```
- Display:
  - Day number
  - Question count (if exists)

---

## Phase 4: Visual Feedback

### Prompt 4.1: Highlight States (Single-Shot)
Apply styles:
- Default → white
- Has questions → light blue
- Today → stronger highlight
- Future scheduled → reduced opacity

---

### Prompt 4.2: Question Display Text
Inside each day:
- If questions exist:
  - Today → "X questions"
  - Future → "X questions (available later)"

- Ensure:
  - Today is bold and underlined
  - Future appears faded

---

## Phase 5: Interaction Logic

### Prompt 5.1: Click Behavior (Single-Shot)
Add click handler:
- Only allow click if:
```js
item.count > 0 && item.dateKey === todayKey
```

- On click:
```js
alert(`Review ${item.count} questions`);
```

---

### Prompt 5.2: Cursor Feedback
- Today with questions → pointer cursor
- All others → default cursor

---

## Phase 6: Month Navigation

### Prompt 6.1: Add State (Single-Shot)
Add:
```js
const [currentDate, setCurrentDate] = useState(new Date());
```

---

### Prompt 6.2: Navigation Controls
Add buttons:
- `<` for previous month
- `>` for next month

Update state accordingly

---

### Prompt 6.3: Dynamic Rendering
Use `currentDate` for:
- Month display
- Year display
- Calendar calculations

---

## Phase 7: Integration & Future Work

### Prompt 7.1: Active Recall Integration
Ensure:
- Schedule is generated from question results
- Calendar reflects review schedule output

---

### Prompt 7.2: Future Enhancements
Prepare for:
- Backend schedule storage
- Spaced repetition algorithm
- Review session page (`/review/:date`)
- Question retrieval by date

---

## Phase 8: Testing & Validation

### Prompt 8.1: Calendar Workflow Test
1. Schedule loads from localStorage
2. Calendar renders correctly
3. Dates align properly
4. Review days highlighted
5. Today updates dynamically
6. Click works only for today
7. Future days are not clickable
8. Month navigation works

---

## Implementation Notes

- Keep UI simple and readable
- Do not over-engineer logic
- Avoid external date libraries
- Maintain consistency with existing layout
- Prioritize UX clarity