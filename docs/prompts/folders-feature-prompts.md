# Folders Feature Implementation Prompts

## Overview
Implement VS Code-like folder management where folders are expandable/collapsible in a left sidebar, notes appear under each folder, and clicking a note displays it in a detail view on the right. The backend already has full folder support via store.js and notes.js API routes.

## Existing Layout Structure
The app already has a sidebar in `frontend/src/components/AppLayout.jsx` with three sections:
- `.sidebar-top` - Logo ("AI Student Notebook" / "Study Better") - **DO NOT MODIFY**
- `.sidebar-middle` - Scrollable area (currently shows "New Notes" link) - **INSERT FoldersSidebar HERE**
- `.sidebar-bottom` - Main navigation (Dashboard, Folders) + Logout - **DO NOT MODIFY**
- `.content-area` - Main content rendered via `<Outlet />` - **Display NoteDetailPage or FoldersPage here**

**Key constraint:** FoldersSidebar component must fit into the existing `.sidebar-middle` container and work with the existing AppLayout structure. Do not refactor AppLayout itself.

---

## Design Decisions (User-Confirmed)

1. **Empty Folders Visible:** Empty folders are displayed in the sidebar so users can easily create new notes and assign them to those folders.
2. **Default "Unsorted" Folder:** Notes created without a folder assignment automatically appear in a special "Unsorted" folder at the top or bottom of the folder list.
3. **Flat Structure:** Folders are NOT nested/hierarchical. All folders are at the same level (no subfolders).
4. **Click to Expand:** Clicking a folder name (or the folder item) toggles its expanded/collapsed state. No separate chevron/arrow button required (though a chevron icon should still show rotation state).
5. **Sort by Creation Date:** Folders are sorted by creation date (oldest first or newest first - to be decided).
6. **Permanent Deletion:** Deleting a folder is permanent with NO option to recover. Show a confirmation pop-up asking "Are you sure you want to delete this folder? This action cannot be undone."
7. **No Customization:** Folder colors, icons, and labels are not customizable in this MVP. Standard styling only.

---

## Phase 1: Sidebar Components

### Prompt 1.1: FolderItem Component (Single-Shot)
Create a reusable `frontend/src/components/FolderItem.jsx` component that:
- Displays a single folder with an expand/collapse chevron icon
- Shows folder name and note count (e.g., "Biology (5)") or empty state "Biology (empty)"
- Accepts props: `folder`, `isExpanded`, `onToggle`, `onSelectNote`, `selectedNoteId`, `notes`
- When expanded, renders a list of notes in that folder (filter `notes` array by folder.id)
- Each note appears as a clickable item with hover styling
- Clicking a note calls `onSelectNote(noteId)` callback and applies active/selected styling
- **Clicking the folder name/item itself toggles expand/collapse** (not a separate button)
- Use CSS that mimics VS Code tree styling (indentation, hover background, icons)
- Include keyboard support (arrow keys to navigate, Enter to select)
- Empty folders are still visible and can be clicked to expand/collapse

**Key behaviors:**
- Chevron rotates when expanded/collapsed
- Clicking folder name toggles expanded state
- Note items indented under folder
- Visual feedback for selected note
- Empty folders show "(empty)" but remain visible
- Hover effects for interactivity

---

### Prompt 1.2: FoldersSidebar Component (Single-Shot)
Create `frontend/src/components/FoldersSidebar.jsx` that:
- Is designed to render **inside** the existing `.sidebar-middle` container in AppLayout.jsx
- Displays a list of all folders sorted by **creation date** (oldest first), fetch via `listFolders()` API call on mount
- **At the top, always show a default "Unsorted" folder** containing all notes where `folderId === null`
- Fetch all notes via `getNotes()` API and pass notes list to FolderItem components
- For each folder (including Unsorted), render a `FolderItem` component
- Manage expanded/collapsed state for each folder (keyed by folderId)
- Track which note is currently selected across all folders
- Has a "+ New Folder" button that opens a dialog/form for folder creation
- Handle folder creation with `createFolder(name)` API call
- Pass `onSelectNote` callback to FolderItem to notify parent when note is clicked
- Props received from AppLayout: `selectedNoteId`, `onSelectNote` (callbacks from parent)
- Side effects: Fetch folders and notes on mount, refresh both lists after create/delete/move operations
- Must be scrollable to handle many folders/notes and not overflow into sidebar-bottom

**Key behaviors:**
- Load all folders and notes on component mount
- Always display "Unsorted" folder at the top with notes that have no folder assignment
- Allow toggling expanded state per folder by clicking folder name
- Empty folders are visible and remain selectable
- Pass selected note ID to child components
- Create new folder via dialog input
- Folders sorted by creation date
- Remain contained within `.sidebar-middle` height constraints

---

### Prompt 1.3: Add Folder Delete + Rename UI to FoldersSidebar
Enhance the FoldersSidebar to add folder management:
- Right-click context menu on folder name (or three-dot menu icon) with options: "Rename", "Delete"
- For "Rename": Show inline editable field or modal with text input, submit via API
- For "Delete": Show confirmation dialog with message "Are you sure you want to delete this folder? This action cannot be undone."
  - **Do NOT prevent deletion if folder contains notes** - allow deletion and automatically move notes to "Unsorted" folder
  - Call deleteFolder() API and refresh the folder list
- After delete/rename, refresh the folder list and notes
- Cannot delete the "Unsorted" folder (remove delete option from context menu for Unsorted)
- Update backend API call in folders.js route if needed for rename/delete endpoints

**Backend validation:**
- Ensure `deleteFolderById(folderId)` and `renameFolderById(folderId, newName)` exist in store.js
- If not, add them with proper validation (folder exists, name not empty, cannot delete Unsorted)
- When a folder is deleted, automatically move all notes in that folder to Unsorted (set folderId to null)
- Add DELETE /api/folders/:id and PATCH /api/folders/:id routes in Backend/routes/folders.js
- Prevent deletion of the special "Unsorted" folder (return 400 error if attempted)

---

## Phase 2: Detail View & Main Layout

### Prompt 2.1: NoteDetailPage Component (Single-Shot)
Create `frontend/src/pages/NoteDetailPage.jsx` that:
- Accepts noteId via URL param (e.g., `/notes/:id`) or as a prop passed from parent component
- Fetch note data on mount via `getNoteById(noteId)` API call
- Display in read-only format (or editable if requirements change):
  - Note title (as heading)
  - Note content (in scrollable container)
  - Created date and last modified date
  - Folder name (linked to expand/highlight that folder in sidebar)
  - Summary (if available)
- Include buttons:
  - "Edit" - to edit the note (or navigate to edit page)
  - "Delete" - with confirmation, calls deleteNote() API
  - "Move to Folder" - dropdown to reassign folder via PATCH /api/notes/:id/folder
  - "Generate Questions" - navigate to QuestionsPage for this note
  - "Back to Folders" - return to folder view
- Error handling for note not found (404)
- Loading state while fetching note

**Key features:**
- Clean, readable layout with good typography
- Metadata (dates) displayed clearly
- Action buttons positioned intuitively
- Responsive for different screen sizes

---

### Prompt 2.2: Update FoldersPage to Use New Components (Single-Shot)
Modify/enhance `frontend/src/pages/FoldersPage.jsx` to:
- Import FoldersSidebar and NoteDetailPage components
- Manage state:
  - `selectedNoteId` - which note is currently being viewed
  - `folders` and `notes` - fetch from API and pass to children
- Render layout using existing AppLayout structure:
  - Render FoldersSidebar in AppLayout's `.sidebar-middle` (via AppLayout props or context)
  - Render detail pane in the main `.content-area`:
    - If no note selected: Show empty state message ("Select a note from the left")
    - If note selected: Render NoteDetailPage with the selected noteId
- Implement `onSelectNote` callback to update `selectedNoteId` state
- Handle note deletion: Remove from state and reset selectedNoteId
- Handle folder operations: Refresh both folders and notes lists

**Note:** Consider whether FoldersPage should be the main route or if FoldersSidebar should load in AppLayout globally. Current routing has `/folders` → FoldersPage, so FoldersSidebar logic likely goes in FoldersPage.

---

## Phase 3: Integration & Updates

### Prompt 3.1: Update App.jsx Routing (Optional) (Single-Shot)
Review `frontend/src/App.jsx` routing:
- Current route "/folders" → FoldersPage - **KEEP AS IS, will be enhanced in Prompt 2.2**
- Keep "/notes/new" route as NotesInputPage
- Consider adding "/notes/:id" route to render NoteDetailPage directly (for deep linking)
- Ensure AppLayout still wraps all routes

**Note:** No significant changes to App.jsx needed; FoldersPage will handle the folder + detail view logic internally.

---

### Prompt 3.2: Update NotesInputPage Folder Selector (Single-Shot)
Enhance `frontend/src/pages/NotesInputPage.jsx` to:
- Add a folder selector dropdown or combobox above the content textarea
- Fetch folders on component mount via `listFolders()` API call
- Show "No folder (Unsorted)" as default option
- Allow user to select a folder before saving note
- After saving note, option 1: redirect to `/folders` with the newly selected folder expanded and note selected
- Or option 2: redirect to `/notes/{newNoteId}` (direct note detail view)
- Update the status message to acknowledge which folder the note was saved to

**Behavior:**
- Folder selector populated on mount
- Default value: "No folder"
- After submit: navigate to /folders and pass state to auto-select the new note, OR navigate to /notes/{id}

---

### Prompt 3.3: Add API Helper Functions to services/api.js (Single-Shot)
Ensure `frontend/src/services/api.js` exports:
- `listFolders()` - GET /api/folders
- `createFolder(name)` - POST /api/folders
- `renameFolder(folderId, newName)` - PATCH /api/folders/:id
- `deleteFolder(folderId)` - DELETE /api/folders/:id
- `moveNoteToFolder(noteId, folderId)` - PATCH /api/notes/:id/folder
- `deleteNote(noteId)` - DELETE /api/notes/:id
- `getNotes()` - GET /api/notes (if not already present)
- Any others needed for detail view interactions

**Validation:**
- Each function should use the shared `request()` helper for consistent error handling
- Network errors should return "Cannot reach backend" message
- Return proper JSON responses with error messages on failure

---

## Phase 4: Backend Completeness

### Prompt 4.1: Complete Backend Folder Routes (Single-Shot)
Review/enhance `Backend/routes/folders.js` to ensure:
- GET /api/folders
- POST /api/folders - create folder
- PATCH /api/folders/:id - rename folder (update name in store.js)
- DELETE /api/folders/:id - delete folder (update store.js)
  - When a folder is deleted, automatically move all notes in that folder to Unsorted (set folderId to null)
  - Return 400 error if attempting to delete the "Unsorted" folder
  - Validation: folder exists before delete

**Store.js additions needed:**
- Create an "Unsorted" folder automatically on server startup (or on first access) with a special marker
- `deleteFolder(folderId)` - remove from folders array, move all notes to Unsorted, cannot delete Unsorted
- `renameFolder(folderId, newName)` - update name, return updated folder, cannot rename Unsorted
- Ensure Unsorted folder always exists and is always returned first in `listFolders()`

---

### Prompt 4.2: Complete Backend Notes Routes (If Needed) (Single-Shot)
Review `Backend/routes/notes.js` and ensure:
- DELETE /api/notes/:id - delete single note (add to store.js and route)
  - Validation: note exists before delete
- PUT /api/notes/:id - full update of note (optional, for edit page)
- Other CRUD operations as needed for detail view

**Additions to store.js if not present:**
- `deleteNote(noteId)` - remove note and return success

---

## Phase 5: Styling & UX Polish

### Prompt 5.1: Add CSS for Folders Feature to App.css (Single-Shot)
Enhance `frontend/src/App.css` with styles for the folder tree (DO NOT modify existing `.sidebar` or `.app-shell` styles):
- `.folders-sidebar` - container for the folder tree in `.sidebar-middle`
  - Should be scrollable vertically
  - Maintains existing sidebar styling (text color, font, padding)
- `.folder-item` - folder in sidebar with hover styling
  - `.folder-icon` - chevron icon with rotation animation
  - `.folder-name` - folder name and note count
  - Padding/indentation to match sidebar
- `.folder-notes-list` - indented list of notes under folder
- `.note-item` - individual note in list
  - Active/selected state with background color (subtle, VS Code blue-ish or sidebar accent)
  - Hover state (slight background)
  - Text truncation for long titles
  - Proper indentation (further right than folder)
- `.note-detail-pane` - detail view in main content area
  - `.note-header` - title and metadata
  - `.note-content` - scrollable note body
  - `.note-actions` - button row at bottom or top
- `.empty-state` - message when no note selected
- `.folder-input` - styling for new folder input (inline or modal)
- `.context-menu` - styling for right-click menu (if using)

**Accessibility:**
- Sufficient color contrast for all interactive elements
- Focus indicators for keyboard navigation
- Proper spacing and sizing for touch targets
- Maintain existing sidebar accessibility features

---

## Phase 6: Testing & Validation

### Prompt 6.1: End-to-End Folder Workflow Test (Single-Shot)
Create a test checklist to validate the folders feature:
1. Sidebar displays all folders with correct note counts
2. Click folder → expands and shows notes in that folder
3. Click note → displays in detail pane with full content
4. Create new folder → appears in sidebar immediately
5. Rename folder → updates in sidebar without refresh
6. Delete empty folder → removed from sidebar
7. Delete folder with notes → shows warning or moves notes
8. NotesInputPage folder selector → populated on load
9. Create note with folder → appears under folder in sidebar
10. Move note to different folder → updates sidebar tree
11. Delete note → removed from sidebar and detail pane
12. Back button / navigation → returns to folder view
13. Direct URL navigation (/notes/:id) → loads note detail
14. Responsive layout → sidebar collapses or resizes on mobile
15. Keyboard navigation → arrow keys move through folders/notes, Enter selects

---

## Implementation Order (Recommended)

1. **Prompt 4.1 & 4.2** - Complete backend store.js and routes (add deleteFolder, renameFolder, deleteNote)
2. **Prompt 3.3** - Add API helpers to frontend services/api.js
3. **Prompt 1.1** - Create FolderItem component
4. **Prompt 1.2** - Create FoldersSidebar component  
5. **Prompt 2.1** - Create NoteDetailPage component
6. **Prompt 2.2** - Update FoldersPage to integrate FoldersSidebar + NoteDetailPage
7. **Prompt 1.3** - Add folder delete/rename UI to FoldersSidebar
8. **Prompt 5.1** - Add comprehensive CSS styling for folder tree and detail view
9. **Prompt 3.2** - Update NotesInputPage folder selector
10. **Prompt 3.1** - Review/update App.jsx routing if needed
11. **Prompt 6.1** - Test all functionality

---

## Notes for Implementation

- **Existing Sidebar Structure:** The app already has AppLayout with `.sidebar-top`, `.sidebar-middle`, and `.sidebar-bottom`. FoldersSidebar will render in `.sidebar-middle` and must respect the existing height/scrolling constraints. Do not refactor AppLayout itself.
- **FoldersPage as Central Hub:** FoldersPage will become the main interface for viewing folders and notes. It manages state (selectedNoteId, folders, notes) and passes them to FoldersSidebar and NoteDetailPage as children.
- **Data Persistence:** Current store.js is in-memory. Data resets on server restart. Consider adding database persistence after the UI is complete.
- **Folder Organization:** Users can have unlimited folders. No folder hierarchy/nesting initially (keep it flat like simple file manager).
- **Bulk Operations:** Drag-and-drop folder/note organization is a stretch goal, not required for MVP.
- **Search:** Finding notes across folders via search is a future feature, not part of this phase.
- **Sync:** Multi-tab sync (changes in one tab appear in another) requires additional work, not part of this phase.

---

## Key Backend APIs Ready to Use

All these endpoints are already functional or need minor completion:

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | /api/folders | Ready | Returns folders with noteCount |
| POST | /api/folders | Ready | Creates new folder |
| PATCH | /api/folders/:id | Partial | Needs rename logic in store.js |
| DELETE | /api/folders/:id | Partial | Needs delete logic in store.js |
| GET | /api/notes | Ready | Lists all notes |
| POST | /api/notes | Ready | Creates note with folderId |
| GET | /api/notes/:id | Ready | Gets note detail |
| PATCH | /api/notes/:id/folder | Ready | Moves note to folder |
| DELETE | /api/notes/:id | Missing | Needs addition |

---

## Implementation Ready

All design decisions have been confirmed. Ready to begin implementation following the prompts in order.
