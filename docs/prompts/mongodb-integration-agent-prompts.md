# MongoDB Integration Agent Prompts

## Purpose
Use this file as the working prompt set for integrating MongoDB into the current project. It expands the "What the Agent Will Do" section into concrete implementation prompts.

---

## Prompt Set Overview

The project already has:
- An Express backend in `Backend/`
- A React frontend that calls the backend through `/api/*` endpoints
- An in-memory data store in `Backend/src/data/store.js`
- Existing note, folder, and questions routes
- MongoDB Atlas already set up
- `mongoose` already installed

Your job is to replace the in-memory backend data layer with MongoDB while keeping the frontend API contract unchanged.

---

## Prompt 1: Create MongoDB Connection Setup

**Goal:** Connect the backend to MongoDB Atlas on startup.

**Prompt:**
Create a MongoDB connection module at `Backend/src/config/db.js` that:
- Reads `MONGODB_URI` from environment variables
- Throws a clear error if `MONGODB_URI` is missing
- Connects using Mongoose
- Exports a reusable async `connectMongoDB()` function
- Optionally exports a disconnect helper for tests

Then update backend startup so the app connects to MongoDB before serving requests.

**Success Criteria:**
- Backend can connect to Atlas successfully
- Backend startup fails clearly if the URI is missing or invalid
- Existing routes still load after connection succeeds

---

## Prompt 2: Create Note Model

**Goal:** Replace note storage with a MongoDB schema.

**Prompt:**
Create `Backend/src/models/Note.js` with a Mongoose schema that supports:
- `title`
- `content`
- `folderId` as nullable
- `summary`
- `createdAt`
- `updatedAt`

Preserve the current app behavior:
- Notes in no folder should use `folderId: null`
- Returned note objects should still expose folder name information when needed

**Success Criteria:**
- Note schema matches the current note object shape closely
- Note creation, update, retrieval, and deletion are supported

---

## Prompt 3: Create Folder Model

**Goal:** Replace folder storage with a MongoDB schema.

**Prompt:**
Create `Backend/src/models/Folder.js` with a Mongoose schema that supports:
- `name`
- `createdAt`
- `updatedAt`

Preserve current folder behavior:
- Folder names are required
- Folder deletion should move notes to Unsorted by setting their `folderId` to `null`
- The frontend should still receive a special Unsorted folder representation if needed for display

**Success Criteria:**
- Folder schema works for create, rename, delete, and list operations
- Unsorted behavior remains intact

---

## Prompt 4: Add Data Access Layer

**Goal:** Keep route files thin by moving database operations into reusable helpers.

**Prompt:**
Create optional repository-style helpers such as:
- `Backend/src/models/noteRepository.js`
- `Backend/src/models/folderRepository.js`

These helpers should handle common data operations like:
- List all notes
- Get note by id
- Create note
- Update note folder
- Delete note
- List folders
- Create folder
- Rename folder
- Delete folder and move notes to Unsorted

If you choose not to add repositories, put the MongoDB queries directly in the route handlers, but keep the logic organized and reusable.

**Success Criteria:**
- MongoDB queries are no longer inside the old in-memory store
- Route files do not contain large blocks of persistence logic

---

## Prompt 5: Refactor Notes Routes

**Goal:** Keep the existing notes API working with MongoDB.

**Prompt:**
Update `Backend/routes/notes.js` so it uses MongoDB instead of `Backend/src/data/store.js`.

Keep the same endpoints and behavior:
- `GET /api/notes`
- `POST /api/notes`
- `GET /api/notes/:id`
- `DELETE /api/notes/:id`
- `PATCH /api/notes/:id/folder`

Preserve current rules:
- Notes require `title` and `content`
- Invalid folder ids should be rejected
- Moving a note should update its `folderId`
- Notes should still return `folderName` when fetched

**Success Criteria:**
- Frontend requests still work without changing `frontend/src/services/api.js`
- Note creation, deletion, retrieval, and folder movement all work with MongoDB

---

## Prompt 6: Refactor Folder Routes

**Goal:** Keep the existing folders API working with MongoDB.

**Prompt:**
Update `Backend/routes/folders.js` so it uses MongoDB instead of `Backend/src/data/store.js`.

Keep the same endpoints and behavior:
- `GET /api/folders`
- `POST /api/folders`
- `PATCH /api/folders/:id`
- `DELETE /api/folders/:id`

Preserve current rules:
- Unsorted cannot be renamed or deleted
- Deleting a folder moves its notes to `folderId: null`
- Returned folders can still include note counts if the frontend expects them

**Success Criteria:**
- Folder management works with MongoDB
- Existing sidebar behavior still works

---

## Prompt 7: Update App Startup

**Goal:** Make MongoDB connection part of backend startup.

**Prompt:**
Update `Backend/app.js` and/or `Backend/server.js` so the app connects to MongoDB before listening.

Use the existing Express setup and keep the middleware and route registration intact.

**Success Criteria:**
- Backend only starts after MongoDB connection succeeds
- Errors are surfaced clearly in the console
- Existing routes still mount correctly

---

## Prompt 8: Verify Frontend Compatibility

**Goal:** Make sure the React app does not need API changes.

**Prompt:**
Verify that the frontend continues to work with the same backend contract.

Check these files and flows:
- `frontend/src/services/api.js`
- note creation flow
- folder creation flow
- note move flow
- note detail page
- questions page

Do not change the frontend endpoints unless MongoDB integration forces a response shape adjustment. If possible, keep responses identical to the current API.

**Success Criteria:**
- Frontend components do not need a rewrite
- Notes, folders, and questions still load and save correctly

---

## Prompt 9: Test the Full Flow

**Goal:** Validate the MongoDB migration end to end.

**Prompt:**
After refactoring, test the following scenarios:
- Create a note in Unsorted
- Create a note in a named folder
- Move a note between folders
- Rename a folder
- Delete a folder and confirm its notes move to Unsorted
- Open a note and confirm its folder name is correct
- Open the Questions page and confirm it still loads note content

**Success Criteria:**
- No endpoint regressions
- MongoDB data persists correctly
- The frontend still behaves the same way

---

## Implementation Order

Use this order if you want the migration to stay low-risk:
1. Create `db.js`
2. Create `Note` and `Folder` models
3. Add repository helpers if desired
4. Refactor `notes.js`
5. Refactor `folders.js`
6. Wire startup connection into `app.js` or `server.js`
7. Test the API
8. Confirm frontend compatibility

---

## Important Constraints

- Do not change the frontend unless required
- Do not change endpoint paths unless absolutely necessary
- Preserve the Unsorted folder behavior
- Preserve `folderId: null` for notes that are not assigned to a folder
- Keep responses stable so the current React code continues to work

---

## Ready-to-Use Agent Prompt

You can give the agent this short instruction set:

> Integrate MongoDB Atlas into the current backend. Create `Backend/src/config/db.js`, add Note and Folder Mongoose models, refactor `Backend/routes/notes.js` and `Backend/routes/folders.js` to use MongoDB, keep the same API endpoints and response shapes, preserve Unsorted folder behavior, and verify the frontend still works without API changes.

---

## Notes for Future Work

If you later want MVC cleanup, that can be a separate phase after MongoDB is stable. For now, keep the migration focused on replacing the data layer first.
