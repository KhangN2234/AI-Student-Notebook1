# Active Recall Feature Implementation Prompts

## Overview
Implement an active recall system where users can generate study questions from their notes, answer them interactively, and review their understanding. This feature builds on the existing `/api/questions` endpoint and enhances it with user interaction.

---

## Design Decisions (User-Confirmed)

1. **Question Generation Source:** Questions are generated from note content using backend API (`POST /api/questions`)
2. **Simple Interaction First:** Users answer questions via text input (no complex grading required for MVP)
3. **No Persistent Scoring (MVP):** Answers are not stored long-term initially
4. **Expandable Feature:** Can later include multiple choice or correctness evaluation
5. **Per-Note Context:** Questions are always tied to a specific note
6. **Immediate Feedback:** Users see whether they answered or skipped

---

## Phase 1: Question Generation

### Prompt 1.1: Generate Questions API Usage
Enhance frontend to call existing backend:
- Endpoint: `POST /api/questions`
- Payload: `{ content: note.content }`
- Response: `{ questions: [...] }`
- Triggered by button: "Generate Questions"

---

## Phase 2: Questions UI

### Prompt 2.1: QuestionsPage Enhancement
Enhance `frontend/src/pages/QuestionsPage.jsx` to:
- Display generated questions in a structured list
- Add input field for each question
- Maintain local state for answers (`answers[index]`)
- Provide clean layout for readability

---

### Prompt 2.2: Answer Interaction
Add functionality:
- Each question has a corresponding input field
- User types answer freely (no strict validation)
- Track answers using React state

---

## Phase 3: Feedback System

### Prompt 3.1: Submit Answers
Add a "Submit Quiz" button:
- On click:
  - Check which answers are filled
  - Generate simple feedback:
    - "Answered"
    - "Missing"
- Store results in local state

---

### Prompt 3.2: Display Feedback
Render results:
- Show feedback under each question
- Highlight unanswered questions
- Optional: color indicators (green/red)

---

## Phase 4: Navigation & Integration

### Prompt 4.1: Connect to Notes
Ensure:
- QuestionsPage is accessed via `/notes/:id/questions`
- Fetch note content before generating questions
- Allow navigation back to note detail

---

### Prompt 4.2: Future Integration Hook (IMPORTANT)
Prepare for calendar integration:
- Add button: "Schedule Review"
- Does not need full implementation yet
- Should trigger future calendar feature

---

## Phase 5: Testing & Validation

### Prompt 5.1: Active Recall Workflow Test
1. Select note → navigate to QuestionsPage
2. Generate questions successfully
3. Questions render correctly
4. User inputs answers
5. Submit answers → feedback displays
6. Navigation works correctly

---

## Implementation Notes

- Keep UI simple and readable
- Do not over-engineer scoring
- Focus on interaction and flow
- This is an MVP feature — polish later