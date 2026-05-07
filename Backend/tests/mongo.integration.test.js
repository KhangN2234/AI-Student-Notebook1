const request = require('supertest');
const app = require('../app');
const Note = require('../src/models/Note');
const Folder = require('../src/models/Folder');
const {
	setupMongoTestDatabase,
	clearMongoTestDatabase,
	teardownMongoTestDatabase,
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
		const folderRes = await request(app)
			.post('/api/folders')
			.send({ name: 'Biology' });

		expect(folderRes.statusCode).toBe(201);
		expect(folderRes.body.folder).toMatchObject({ name: 'Biology' });
		expect(folderRes.body.folder.id).toBeDefined();

		const folderId = folderRes.body.folder.id;

		const noteRes = await request(app)
			.post('/api/notes')
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

		const fetchedNoteRes = await request(app).get(`/api/notes/${noteId}`);
		expect(fetchedNoteRes.statusCode).toBe(200);
		expect(fetchedNoteRes.body.note).toMatchObject({
			id: noteId,
			title: 'Cell Structure',
			folderId,
			folderName: 'Biology',
		});

		const foldersBeforeDelete = await request(app).get('/api/folders');
		expect(foldersBeforeDelete.statusCode).toBe(200);
		const biologyFolder = foldersBeforeDelete.body.folders.find((folder) => folder.id === folderId);
		expect(biologyFolder).toBeDefined();
		expect(biologyFolder.noteCount).toBe(1);

		const deleteFolderRes = await request(app).delete(`/api/folders/${folderId}`);
		expect(deleteFolderRes.statusCode).toBe(200);

		const fetchedAfterDeleteRes = await request(app).get(`/api/notes/${noteId}`);
		expect(fetchedAfterDeleteRes.statusCode).toBe(200);
		expect(fetchedAfterDeleteRes.body.note.folderId).toBeNull();
		expect(fetchedAfterDeleteRes.body.note.folderName).toBeNull();

		const foldersAfterDelete = await request(app).get('/api/folders');
		expect(foldersAfterDelete.statusCode).toBe(200);
		expect(foldersAfterDelete.body.folders.find((folder) => folder.id === folderId)).toBeUndefined();

		const unsortedNoteRes = await request(app)
			.post('/api/notes')
			.send({
				title: 'General Study Note',
				content: 'This note should stay unsorted.',
			});

		expect(unsortedNoteRes.statusCode).toBe(201);
		expect(unsortedNoteRes.body.note.folderId).toBeNull();

		const allNotesRes = await request(app).get('/api/notes');
		expect(allNotesRes.statusCode).toBe(200);
		expect(Array.isArray(allNotesRes.body.notes)).toBe(true);
		expect(allNotesRes.body.notes.some((note) => note.id === noteId && note.folderId === null)).toBe(true);
	});

	test('moves a note between folders through the API', async () => {
		const firstFolderRes = await request(app).post('/api/folders').send({ name: 'History' });
		const secondFolderRes = await request(app).post('/api/folders').send({ name: 'English' });

		const firstFolderId = firstFolderRes.body.folder.id;
		const secondFolderId = secondFolderRes.body.folder.id;

		const noteRes = await request(app)
			.post('/api/notes')
			.send({
				title: 'Timeline Note',
				content: 'A note that will be moved.',
				folderId: firstFolderId,
			});

		const noteId = noteRes.body.note.id;

		const moveRes = await request(app)
			.patch(`/api/notes/${noteId}/folder`)
			.send({ folderId: secondFolderId });

		expect(moveRes.statusCode).toBe(200);
		expect(moveRes.body.note.folderId).toBe(secondFolderId);
		expect(moveRes.body.note.folderName).toBe('English');

		const firstFolderAfterMove = await request(app).get('/api/folders');
		const historyFolder = firstFolderAfterMove.body.folders.find((folder) => folder.id === firstFolderId);
		const englishFolder = firstFolderAfterMove.body.folders.find((folder) => folder.id === secondFolderId);

		expect(historyFolder.noteCount).toBe(0);
		expect(englishFolder.noteCount).toBe(1);
	});
});
