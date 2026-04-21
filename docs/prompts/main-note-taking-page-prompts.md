# Main Note-Taking Page Prompts

Use these prompts in order to build and polish the main note-taking page only. This file is focused on the page at route `/notes/new`.

## Prompt 1: Build the page shell

Create the React page for route `/notes/new` in `frontend/src/pages/NotesInputPage.jsx`.
Requirements:
- Keep the page inside the current app layout and navigation.
- Add a page title and short helper text.
- Add a form with fields: note title, folder dropdown, and notes textarea.
- Add a primary save button and a clear button.
- Use semantic HTML labels and proper input `id`/`htmlFor` linkage.
- Keep it responsive for both desktop and mobile.

## Prompt 2: Match SRS mockup look

Style the page so it visually matches the SRS mockup as closely as possible.
Requirements:
- Keep spacing and hierarchy clean: title area, form card, actions row.
- Use a light academic look (not dark mode), clear borders, soft shadows.
- Make textarea the visual focus area and at least 12 rows tall.
- Keep button styles consistent with the app shell.
- Update only the styles needed for this page in `frontend/src/App.css`.
- Do not break styles for other pages.

## Prompt 3: Add validation and UX states

Enhance `frontend/src/pages/NotesInputPage.jsx` with robust form behavior.
Requirements:
- Required validation for title and notes content.
- Show inline error text under fields.
- Disable save while request is in progress.
- Show success confirmation after save and redirect to `/notes`.
- Preserve user content if API fails.

## Prompt 4: Connect to backend API

Wire this page to existing API helper functions in `frontend/src/services/api.js`.
Requirements:
- Load folders from `getFolders()` on mount.
- Submit note via `createNote({ title, content, folderId })`.
- Handle backend errors with user-friendly messages.
- Keep logic in the page component and do not duplicate API code.

## Prompt 5: Add file upload placeholder

Add a non-functional file upload UI section to the note-taking page.
Requirements:
- Add upload control labeled "Upload notes file (coming soon)".
- Accept `.txt`, `.md`, `.pdf`, `.docx` in the input attributes.
- Display a clear note that upload parsing is not yet implemented.
- Keep this section visually secondary to manual note entry.

## Prompt 6: Final polish and accessibility pass

Do an accessibility and quality pass on `frontend/src/pages/NotesInputPage.jsx` and related styles.
Checklist:
- Keyboard navigation works end-to-end.
- Inputs have visible focus styles.
- Label text is clear and concise.
- No console warnings.
- Keep ESLint clean.

## Single-shot prompt (if you want one prompt instead of six)

Refactor and polish the main note-taking page at route `/notes/new` in this React Vite app. Work in `frontend/src/pages/NotesInputPage.jsx` and minimally in `frontend/src/App.css`. Match the SRS mockup style direction: clean light layout, strong textarea focus, clear title and helper text, and a simple card-style form. Keep fields for note title, folder select, and notes content. Add validation for required title/content, inline errors, disabled save during submit, backend integration using existing `getFolders` and `createNote` from `frontend/src/services/api.js`, and success feedback before navigation to `/notes`. Add a visible but non-functional upload placeholder section marked as coming soon. Ensure the page is responsive and accessible with proper labels, focus states, and keyboard flow. Do not regress other pages.
