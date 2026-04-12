# NotesInputPage Backend Prompts

Use these prompts in order to build and enhance the backend for the note creation feature on the main note-taking page. The frontend page is at route `/notes/new` and calls `POST /api/notes`.

## Prompt 1: Enhance the POST /api/notes endpoint validation

Review the existing `POST /api/notes` endpoint in `Backend/server.js`.
Requirements:
- Validate that `title` field is not empty and not just whitespace.
- Validate that `content` field is not empty and not just whitespace.
- Validate that `folderId` (if provided) references an existing folder or is null/missing.
- Return a 400 status with an error message if validation fails.
- Return a 201 status with the created note object on success.
- Include fields in response: id, title, content, folderId, folderName, createdAt, updatedAt.

## Prompt 2: Improve error messages and response consistency

Update the `POST /api/notes` endpoint error responses.
Requirements:
- Return consistent JSON error format: `{ message: "Human-readable error message" }`.
- Distinguish between validation errors (400) and server errors (500).
- Error messages should be clear for the frontend user (e.g., "Note title is required").
- Success response should wrap the note in `{ note: {...} }` object.

## Prompt 3: Add request size limits and sanitization

Add safety guards to the `POST /api/notes` endpoint.
Requirements:
- Enforce a reasonable max request body size (e.g., 1MB).
- Trim whitespace from title and content strings before storing.
- Reject excessively long titles (e.g., max 500 characters).
- Reject excessively long content (e.g., max 50,000 characters as soft limit).
- Return a 413 or 400 error if limits are exceeded.

## Prompt 4: Implement persistent storage (MongoDB or file-based)

Replace the in-memory data store with persistent storage.
Requirements:
- Choose MongoDB (preferred) or file-based JSON storage if MongoDB is unavailable.
- Define a Note schema/model with fields: id/\_id, title, content, folderId, createdAt, updatedAt.
- Update `Backend/src/data/store.js` to use the chosen storage backend.
- Ensure old in-memory data is gracefully migrated or replaced.
- Add connection error handling and retry logic.

## Prompt 5: Add database timestamps and validation

Enhance the Note model with robust metadata.
Requirements:
- Auto-generate `createdAt` timestamp when a note is created.
- Auto-generate `updatedAt` timestamp on creation.
- Validate folder references exist before accepting folderId.
- Include folderName in the response by joining with the Folder collection.
- Return the complete note object immediately after creation (no extra fetch needed).

## Prompt 6: Add endpoint tests

Write tests for the `POST /api/notes` endpoint.
Requirements:
- Test successful note creation with valid title, content, and folderId.
- Test successful note creation with valid title and content, no folderId.
- Test validation failure: missing title.
- Test validation failure: missing content.
- Test validation failure: invalid folderId.
- Test validation failure: title or content exceeds max length.
- Each test should verify the response status code and response body structure.
- Use a simple test framework (e.g., Jest or Node's built-in assert).

## Prompt 7: Add request logging and monitoring

Add observability to the `POST /api/notes` endpoint.
Requirements:
- Log incoming requests with timestamp, method, path, and request body summary.
- Log successful creations with the note id and timestamp.
- Log errors with the error type and message.
- Do not log sensitive data or full request/response bodies.
- Keep logs structured so they can be parsed by monitoring tools.

## Single-shot prompt (if you want one comprehensive prompt instead of seven)

Enhance and test the backend for note creation (`POST /api/notes` endpoint) in `Backend/server.js` and `Backend/src/data/store.js`. Improve validation: require non-empty title and content, max 500 chars for title and 50KB for content, validate folderId references if provided, return consistent error format `{ message: "..." }` with 400 for validation and 500 for server errors. Add safety guards: trim whitespace, enforce 1MB request size limit, reject oversized payloads with 413. Persist data using MongoDB (or file-based JSON fallback if Mongo unavailable). Enhance the Note model: auto-generate createdAt/updatedAt, include folderName in response via folder join, validate all references. Add comprehensive tests: successful creation with/without folder, validation failures for missing/invalid fields, length limits. Add structured logging of requests and responses. Return success as `{ note: { id, title, content, folderId, folderName, createdAt, updatedAt } }` with 201 status.
