# Active Recall Feature Implementation Prompts

## Overview
Implement an active recall system where users can generate AI-powered study questions from their notes, answer them interactively, and receive immediate feedback including correctness, correct answers, and explanations.

---

## Design Decisions (User-Confirmed)

1. **AI-Based Question Generation:** Questions, correct answers, and explanations are generated via backend API (`POST /api/questions`)
2. **Per-Note Context:** Questions are always tied to a specific note
3. **Auto-Generation with Fallback:** Questions generate automatically on page load, with optional manual regeneration
4. **Free Response Input:** Users answer questions using text input
5. **Basic Grading System (MVP):**
   - Correct
   - Partially Correct
   - Incorrect / Missing
6. **Heuristic Grading (MVP):**
   - Uses simple length-based comparison (not semantic understanding)
   - Designed to be replaceable with AI grading later
7. **Visual Feedback System:**
   - Green → Correct
   - Yellow → Partial
   - Red → Incorrect / Missing
8. **Immediate Feedback:**
   - Feedback is shown after submission
   - Includes correct answer and explanation
9. **No Persistent Scoring (MVP):** Results are not stored long-term
10. **Future-Ready Design:** Structure allows future AI grading, progress tracking, and spaced repetition

---

## Phase 1: Question Generation

### Prompt 1.1: Generate Questions API Usage
Frontend calls backend:
- Endpoint: `POST /api/questions`
- Payload: `{ noteId, content }` (noteId may be passed but is not required for generation)
- Response:
```json
{
  "questions": [
    {
      "question": "...",
      "answer": "...",
      "explanation": "..."
    }
  ]
}
```

- Questions auto-generate on page load
- Manual regeneration is not part of the primary MVP flow

---

## Phase 2: Questions UI

### Prompt 2.1: QuestionsPage Implementation
Enhance `frontend/src/pages/QuestionsPage.jsx` to:
- Display generated questions in a structured list
- Add input field for each question
- Maintain local state:
  - `questions`
  - `answers`
  - `results`
- Provide clean, readable layout

---

### Prompt 2.2: Answer Interaction
Add functionality:
- Each question has a corresponding input field
- User types answer freely (no strict validation)
- Track answers using React state (`answers[index]`)

---

## Phase 3: Grading & Feedback System

### Prompt 3.1: Submit Answers
Add a "Submit Answers" button:
- On click:
  - Apply heuristic grading to each answer
  - Assign status:
    - `correct`
    - `partial`
    - `missing`
- Store results in local state

---

### Prompt 3.2: Display Feedback
Render results under each question:
- Highlight **User Answer with color-coded background**
- Display:
  - User Answer
  - Status (Correct / Partially Correct / Incorrect)
- Reveal:
  - Correct Answer
  - Explanation

- Color mapping:
  - Green → Correct
  - Yellow → Partial
  - Red → Incorrect / Missing

---

### Prompt 3.3: Basic Grading Logic (MVP)
- If no answer → `missing`
- If answer length is less than 50% of correct answer → `partial`
- Otherwise → `correct`

Note: This grading is based on length only and does NOT evaluate semantic correctness.

---

## Phase 4: Navigation & Integration

### Prompt 4.1: Connect to Notes
Ensure:
- QuestionsPage is accessed via `/notes/:id/questions`
- Fetch note content before generating questions
- Questions are tied to note content

---

### Prompt 4.2: Future Integration Hooks
Prepare for:
- AI-based grading improvements
- Progress tracking
- Calendar-based review scheduling
- Review sessions / spaced repetition

(No implementation required yet — structure code to support this)

---

## Phase 5: Testing & Validation

### Prompt 5.1: Active Recall Workflow Test
1. Select note → navigate to QuestionsPage
2. Questions auto-generate on load
3. Questions render correctly
4. User inputs answers
5. Submit answers → feedback displays:
   - Color-coded status
   - User answer highlighted
   - Correct answer
   - Explanation
6. Navigation works correctly

---

## Implementation Notes

- Keep UI simple and readable
- Do not over-engineer grading logic
- Focus on clarity and interaction
- This is an MVP feature — polish later