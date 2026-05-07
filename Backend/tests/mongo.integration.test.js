const request = require('supertest');
const app = require('../app');
const Note = require('../src/models/Note');
const Folder = require('../src/models/Folder');
const {
	setupMongoTestDatabase,
	clearMongoTestDatabase,
	teardownMongoTestDatabase,
	createAuthHeader,
} = require('./mongoTestHelper');

jest.setTimeout(60000);

describe('MongoDB integration smoke test', () => {
	beforeAll(async () => {
		await setupMongoTestDatabase();
	});

	afterEach(async () => {
		await clearMongoTestDatabase();
	});

	afterAll(async () => {
		await teardownMongoTestDatabase();
	});

	test('creates folders and notes, then preserves folder metadata when folders are deleted', async () => {
		const auth = await createAuthHeader({ username: 'owner-user' });
		const folderRes = await request(app)
			.post('/api/folders')
			.set(auth.headers)
			.send({ name: 'Biology' });

		expect(folderRes.statusCode).toBe(201);
		expect(folderRes.body.folder).toMatchObject({ name: 'Biology' });
		expect(folderRes.body.folder.id).toBeDefined();

		const folderId = folderRes.body.folder.id;

		const noteRes = await request(app)
			.post('/api/notes')
			.set(auth.headers)
			.send({
				title: 'Cell Structure',
				content: 'Cells have a nucleus, membrane, and cytoplasm.',
				folderId,
			});

		expect(noteRes.statusCode).toBe(201);
		expect(noteRes.body.note).toMatchObject({
			title: 'Cell Structure',
			folderId,
			folderName: 'Biology',
		});

		const noteId = noteRes.body.note.id;

		const fetchedNoteRes = await request(app).get(`/api/notes/${noteId}`).set(auth.headers);
		expect(fetchedNoteRes.statusCode).toBe(200);
		expect(fetchedNoteRes.body.note).toMatchObject({
			id: noteId,
			title: 'Cell Structure',
			folderId,
			folderName: 'Biology',
		});

		const foldersBeforeDelete = await request(app).get('/api/folders').set(auth.headers);
		expect(foldersBeforeDelete.statusCode).toBe(200);
		const biologyFolder = foldersBeforeDelete.body.folders.find((folder) => folder.id === folderId);
		expect(biologyFolder).toBeDefined();
		expect(biologyFolder.noteCount).toBe(1);

		const deleteFolderRes = await request(app).delete(`/api/folders/${folderId}`).set(auth.headers);
		expect(deleteFolderRes.statusCode).toBe(200);

		const fetchedAfterDeleteRes = await request(app).get(`/api/notes/${noteId}`).set(auth.headers);
		expect(fetchedAfterDeleteRes.statusCode).toBe(200);
		expect(fetchedAfterDeleteRes.body.note.folderId).toBeNull();
		expect(fetchedAfterDeleteRes.body.note.folderName).toBeNull();

		const foldersAfterDelete = await request(app).get('/api/folders').set(auth.headers);
		expect(foldersAfterDelete.statusCode).toBe(200);
		expect(foldersAfterDelete.body.folders.find((folder) => folder.id === folderId)).toBeUndefined();

		const unsortedNoteRes = await request(app)
			.post('/api/notes')
			.set(auth.headers)
			.send({
				title: 'General Study Note',
				content: 'This note should stay unsorted.',
			});

		expect(unsortedNoteRes.statusCode).toBe(201);
		expect(unsortedNoteRes.body.note.folderId).toBeNull();

		const allNotesRes = await request(app).get('/api/notes').set(auth.headers);
		expect(allNotesRes.statusCode).toBe(200);
		expect(Array.isArray(allNotesRes.body.notes)).toBe(true);
		expect(allNotesRes.body.notes.some((note) => note.id === noteId && note.folderId === null)).toBe(true);
	});

	test('moves a note between folders through the API', async () => {
		const auth = await createAuthHeader({ username: 'move-user' });
		const firstFolderRes = await request(app).post('/api/folders').set(auth.headers).send({ name: 'History' });
		const secondFolderRes = await request(app).post('/api/folders').set(auth.headers).send({ name: 'English' });

		const firstFolderId = firstFolderRes.body.folder.id;
		const secondFolderId = secondFolderRes.body.folder.id;

		const noteRes = await request(app)
			.post('/api/notes')
			.set(auth.headers)
			.send({
				title: 'Timeline Note',
				content: 'A note that will be moved.',
				folderId: firstFolderId,
			});

		const noteId = noteRes.body.note.id;

		const moveRes = await request(app)
			.patch(`/api/notes/${noteId}/folder`)
			.set(auth.headers)
			.send({ folderId: secondFolderId });

		expect(moveRes.statusCode).toBe(200);
		expect(moveRes.body.note.folderId).toBe(secondFolderId);
		expect(moveRes.body.note.folderName).toBe('English');

		const firstFolderAfterMove = await request(app).get('/api/folders').set(auth.headers);
		const historyFolder = firstFolderAfterMove.body.folders.find((folder) => folder.id === firstFolderId);
		const englishFolder = firstFolderAfterMove.body.folders.find((folder) => folder.id === secondFolderId);

		expect(historyFolder.noteCount).toBe(0);
		expect(englishFolder.noteCount).toBe(1);
	});

	test('keeps notes and folders isolated per authenticated user', async () => {
		const userA = await createAuthHeader({ username: 'user-a' });
		const userB = await createAuthHeader({ username: 'user-b' });

		await request(app).post('/api/folders').set(userA.headers).send({ name: 'A Folder' });
		await request(app).post('/api/folders').set(userB.headers).send({ name: 'B Folder' });

		await request(app)
			.post('/api/notes')
			.set(userA.headers)
			.send({ title: 'A Note', content: 'Owned by A' });

		await request(app)
			.post('/api/notes')
			.set(userB.headers)
			.send({ title: 'B Note', content: 'Owned by B' });

		const foldersA = await request(app).get('/api/folders').set(userA.headers);
		const foldersB = await request(app).get('/api/folders').set(userB.headers);
		expect(foldersA.body.folders.some((folder) => folder.name === 'A Folder')).toBe(true);
		expect(foldersA.body.folders.some((folder) => folder.name === 'B Folder')).toBe(false);
		expect(foldersB.body.folders.some((folder) => folder.name === 'B Folder')).toBe(true);
		expect(foldersB.body.folders.some((folder) => folder.name === 'A Folder')).toBe(false);

		const notesA = await request(app).get('/api/notes').set(userA.headers);
		const notesB = await request(app).get('/api/notes').set(userB.headers);
		expect(notesA.body.notes.some((note) => note.title === 'A Note')).toBe(true);
		expect(notesA.body.notes.some((note) => note.title === 'B Note')).toBe(false);
		expect(notesB.body.notes.some((note) => note.title === 'B Note')).toBe(true);
		expect(notesB.body.notes.some((note) => note.title === 'A Note')).toBe(false);
	});
});
