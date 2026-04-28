# MongoDB Integration Checklist

## Overview
This document outlines all steps needed to prepare the project for MongoDB integration. Complete these tasks before the agent begins refactoring the backend to use MongoDB instead of in-memory storage.

---

## Phase 1: Prerequisites & Setup

### 1.1 Install MongoDB Locally or Set Up MongoDB Atlas

**Option A: MongoDB Community Server (Local)**
- [ ] Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
- [ ] Choose your OS (Windows, macOS, Linux)
- [ ] Follow installation instructions
- [ ] Verify installation: open terminal and run `mongosh` or `mongo --version`
- [ ] Start MongoDB service:
  - Windows: `mongod` in a terminal or MongoDB is running as a service
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud)**
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create a free account (M0 cluster is free)
- [ ] Create a new project
- [ ] Create a database cluster
- [ ] Add a database user with username and password
- [ ] Whitelist your IP address (or allow all IPs for development: 0.0.0.0/0)
- [ ] Get your connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/database-name`)

### 1.2 Verify MongoDB Connection
- [ ] If local: confirm `mongosh` connects successfully
- [ ] If Atlas: test connection string in a MongoDB client or terminal

---

## Phase 2: Backend Environment Setup

### 2.1 Update Backend .env File
Navigate to `Backend/.env` and add:

```
MONGODB_URI=mongodb://localhost:27017/student-notebook-dev
```

Or if using Atlas:

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/student-notebook-dev
```

- [ ] .env file created/updated with MONGODB_URI

### 2.2 Backend Directory Structure Review
Confirm the following backend structure exists:

```
Backend/
├── src/
│   ├── config/          (will be created)
│   ├── data/
│   │   └── store.js     (current in-memory store)
│   ├── models/          (will be created)
│   └── services/        (optional, will be created)
├── routes/
│   ├── notes.js
│   ├── folders.js
│   ├── questions.js
│   └── health.js
├── app.js
├── server.js
├── package.json
└── .env
```

- [ ] Backend folder structure reviewed

---

## Phase 3: NPM Dependencies

### 3.1 Install Required Packages
In the `Backend/` directory, run:

```bash
npm install mongoose
```

Optionally install Mongoose validation helpers:

```bash
npm install validator
```

- [ ] `mongoose` installed in Backend/package.json
- [ ] `validator` installed (optional, for data validation)

### 3.2 Verify Installation
Run in `Backend/` folder:

```bash
npm list mongoose
```

Should output `mongoose@<version>` with no errors.

- [ ] Mongoose installation verified

---

## Phase 4: Current Codebase Review

### 4.1 Review Current In-Memory Store
- [ ] Understand current data model in `Backend/src/data/store.js`:
  - `Note` object structure: `{ id, title, content, folderId, summary, createdAt, updatedAt }`
  - `Folder` object structure: `{ id, name, createdAt, updatedAt, isUnsorted }`
  - Special folder handling: `folderId: null` maps to "Unsorted Notes"

### 4.2 Review Current Route Files
- [ ] Understand how `Backend/routes/notes.js` currently works
- [ ] Understand how `Backend/routes/folders.js` currently works
- [ ] Understand how `Backend/routes/questions.js` currently works
- [ ] Note which endpoints are called from the frontend

### 4.3 Review Frontend API Calls
- [ ] Confirm frontend calls in `frontend/src/services/api.js` will remain the same
- [ ] Endpoint list:
  - `GET /api/notes` - list all notes
  - `POST /api/notes` - create note
  - `GET /api/notes/:id` - get single note
  - `DELETE /api/notes/:id` - delete note
  - `PATCH /api/notes/:id/folder` - move note to folder
  - `GET /api/folders` - list all folders
  - `POST /api/folders` - create folder
  - `PATCH /api/folders/:id` - rename folder
  - `DELETE /api/folders/:id` - delete folder
  - `POST /api/questions` - generate questions from note content

---

## Phase 5: Backup & Documentation

### 5.1 Backup Current Work
- [ ] Commit all current code to git (if using version control):
  ```bash
  git add .
  git commit -m "Backup: before MongoDB integration"
  ```

### 5.2 Document Current Behavior
- [ ] Note any custom behaviors in current in-memory store that must be preserved
- [ ] Note special cases like the "Unsorted" folder behavior
- [ ] Document any validation rules or business logic

---

## Phase 6: Ready for Integration

Once all tasks above are complete, the agent can proceed with:

### What the Agent Will Do
1. [ ] Create `Backend/src/config/db.js` - MongoDB connection setup
2. [ ] Create `Backend/src/models/Note.js` - Mongoose Note schema
3. [ ] Create `Backend/src/models/Folder.js` - Mongoose Folder schema
4. [ ] Create `Backend/src/models/noteRepository.js` - data access layer (optional MVC)
5. [ ] Create `Backend/src/models/folderRepository.js` - data access layer (optional MVC)
6. [ ] Refactor `Backend/routes/notes.js` to use Mongoose models
7. [ ] Refactor `Backend/routes/folders.js` to use Mongoose models
8. [ ] Update `Backend/app.js` to initialize MongoDB connection on startup
9. [ ] Test all endpoints remain functional
10. [ ] Ensure frontend continues to work without changes

### What Will NOT Change
- Frontend React components remain the same
- Frontend API calls remain the same
- Express route endpoints remain the same
- Response JSON structure remains the same

---

## Checklist Summary

### Before Starting MongoDB Integration
- [ ] MongoDB installed locally OR MongoDB Atlas account set up
- [ ] MongoDB URI added to `Backend/.env`
- [ ] `npm install mongoose` completed
- [ ] Current codebase reviewed and understood
- [ ] Git backup created (recommended)
- [ ] Ready for agent to begin integration

### Questions Before Proceeding?
- [ ] What is your MongoDB URI? (Local or Atlas)
- [ ] Do you want MongoDB indexes on `title`, `folderId`, or `createdAt` for faster queries?
- [ ] Should the agent also implement the MVC controller layer, or just swap in-memory store for Mongoose?
- [ ] Do you need input validation beyond Mongoose schema validation?

---

## Next Steps

Once all items in this checklist are complete, you can:

1. Provide the MongoDB URI to the agent
2. Ask the agent to begin MongoDB integration
3. Agent will create models, refactor routes, and test endpoints
4. Run the backend and frontend to verify everything works

**Estimated Time to Complete Checklist:** 15-30 minutes
**Estimated Time for Agent to Integrate MongoDB:** 20-40 minutes
