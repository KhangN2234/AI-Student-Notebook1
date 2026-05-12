jest.mock('axios', () => ({
	post: jest.fn(),
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const app = require('../app');
const User = require('../src/models/User');
const Folder = require('../src/models/Folder');
const Note = require('../src/models/Note');
const ReviewSession = require('../src/models/ReviewSession');
const ReviewSchedule = require('../src/models/ReviewSchedule');
const {
	setupMongoTestDatabase,
	clearMongoTestDatabase,
	teardownMongoTestDatabase,
} = require('./mongoTestHelper');

async function createUserAndAuthHeader(overrides = {}) {
	const username = overrides.username || 'acceptance-user';
	const email = overrides.email || 'acceptance-user@example.com';
	const password = overrides.password || 'Password123!';
	const passwordHash = await bcrypt.hash(password, 10);

	const user = await User.create({ username, email, passwordHash });
	const loginRes = await request(app)
		.post('/api/auth/login')
		.send({ identifier: email, password });

	if (loginRes.statusCode !== 200) {
		throw new Error(`Failed to authenticate acceptance test user: ${loginRes.statusCode}`);
	}

	return {
		user,
		token: loginRes.body.token,
		headers: { Authorization: `Bearer ${loginRes.body.token}` },
		password,
	};
}

beforeAll(async () => {
	await setupMongoTestDatabase();
	process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-groq-key';
});

afterEach(async () => {
	axios.post.mockReset();
	await clearMongoTestDatabase();
});

afterAll(async () => {
	await teardownMongoTestDatabase();
});

describe('Acceptance: project workflows', () => {
	test('health check is available without authentication', async () => {
		const res = await request(app).get('/api/health');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ ok: true });
	});

	test('a user can sign up, sign in, and fetch their profile', async () => {
		const signupRes = await request(app)
			.post('/api/auth/signup')
			.send({
				username: 'student-one',
				email: 'student-one@example.com',
				password: 'Password123!',
			});

		expect(signupRes.statusCode).toBe(201);
		expect(signupRes.body.token).toBeDefined();
		expect(signupRes.body.user).toMatchObject({
			username: 'student-one',
			email: 'student-one@example.com',
		});

		const loginRes = await request(app)
			.post('/api/auth/login')
			.send({ identifier: 'student-one@example.com', password: 'Password123!' });

		expect(loginRes.statusCode).toBe(200);
		expect(loginRes.body.token).toBeDefined();

		const meRes = await request(app)
			.get('/api/auth/me')
			.set('Authorization', `Bearer ${loginRes.body.token}`);

		expect(meRes.statusCode).toBe(200);
		expect(meRes.body.user).toMatchObject({
			username: 'student-one',
			email: 'student-one@example.com',
		});
	});

	test('protected routes reject anonymous access', async () => {
		const notesRes = await request(app).get('/api/notes');
		const foldersRes = await request(app).get('/api/folders');
		const reviewsRes = await request(app).get('/api/reviews');
		const scheduleRes = await request(app).get('/api/schedule');

		expect(notesRes.statusCode).toBe(401);
		expect(foldersRes.statusCode).toBe(401);
		expect(reviewsRes.statusCode).toBe(401);
		expect(scheduleRes.statusCode).toBe(401);
	});

	test('a user can create folders and notes and keep them organized', async () => {
		const { headers } = await createUserAndAuthHeader({
			username: 'folder-student',
			email: 'folder-student@example.com',
		});

		const folderRes = await request(app)
			.post('/api/folders')
			.set(headers)
			.send({ name: 'Biology' });

		expect(folderRes.statusCode).toBe(201);
		expect(folderRes.body.folder).toMatchObject({
			name: 'Biology',
			noteCount: 0,
		});

		const listFoldersRes = await request(app)
			.get('/api/folders')
			.set(headers);

		expect(listFoldersRes.statusCode).toBe(200);
		expect(listFoldersRes.body.folders).toHaveLength(1);
		expect(listFoldersRes.body.folders[0]).toMatchObject({ name: 'Biology', noteCount: 0 });

		const noteRes = await request(app)
			.post('/api/notes')
			.set(headers)
			.send({
				title: 'Cell Structure',
				content: 'Cells contain a nucleus, mitochondria, and membranes.',
				folderId: folderRes.body.folder.id,
			});

		expect(noteRes.statusCode).toBe(201);
		expect(noteRes.body.note).toMatchObject({
			title: 'Cell Structure',
			folderName: 'Biology',
		});

		const listNotesRes = await request(app)
			.get('/api/notes')
			.set(headers);

		expect(listNotesRes.statusCode).toBe(200);
		expect(listNotesRes.body.notes).toHaveLength(1);
		expect(listNotesRes.body.notes[0]).toMatchObject({
			title: 'Cell Structure',
			folderName: 'Biology',
		});

		const getNoteRes = await request(app)
			.get(`/api/notes/${noteRes.body.note.id}`)
			.set(headers);

		expect(getNoteRes.statusCode).toBe(200);
		expect(getNoteRes.body.note).toMatchObject({
			title: 'Cell Structure',
			content: 'Cells contain a nucleus, mitochondria, and membranes.',
		});

		const updateNoteRes = await request(app)
			.patch(`/api/notes/${noteRes.body.note.id}`)
			.set(headers)
			.send({
				title: 'Cell Structure Updated',
				content: 'Cells have organelles and a nucleus.',
				folderId: folderRes.body.folder.id,
			});

		expect(updateNoteRes.statusCode).toBe(200);
		expect(updateNoteRes.body.note).toMatchObject({
			title: 'Cell Structure Updated',
			folderName: 'Biology',
		});

		const deleteNoteRes = await request(app)
			.delete(`/api/notes/${noteRes.body.note.id}`)
			.set(headers);

		expect(deleteNoteRes.statusCode).toBe(200);
		expect(deleteNoteRes.body.message).toBe('Note deleted successfully.');

		const emptyNotesRes = await request(app)
			.get('/api/notes')
			.set(headers);

		expect(emptyNotesRes.statusCode).toBe(200);
		expect(emptyNotesRes.body.notes).toHaveLength(0);
	});

	test('a user can generate questions and review schedule data from a note', async () => {
		const { headers } = await createUserAndAuthHeader({
			username: 'review-student',
			email: 'review-student@example.com',
		});

		const noteRes = await request(app)
			.post('/api/notes')
			.set(headers)
			.send({
				title: 'Photosynthesis',
				content: 'Photosynthesis uses sunlight to convert carbon dioxide and water into glucose.',
			});

		expect(noteRes.statusCode).toBe(201);

		axios.post.mockResolvedValueOnce({
			data: {
				choices: [
					{
						message: {
							content: JSON.stringify([
								{
									question: 'What is photosynthesis?',
									answer: 'A process that converts light energy into chemical energy.',
									explanation: 'Plants use it to make glucose.',
								},
							]),
						},
					},
				],
			},
		});

		const questionsRes = await request(app)
			.post('/api/questions')
			.send({ content: 'Photosynthesis uses sunlight to convert carbon dioxide and water into glucose.' });

		expect(questionsRes.statusCode).toBe(200);
		expect(questionsRes.body.questions).toHaveLength(1);
		expect(questionsRes.body.questions[0]).toMatchObject({
			question: 'What is photosynthesis?',
		});

		const scheduleRes = await request(app)
			.post('/api/schedule')
			.set(headers)
			.send({
				results: [
					{ status: 'correct' },
					{ status: 'partial' },
					{ status: 'incorrect' },
				],
				noteId: noteRes.body.note.id,
			});

		expect(scheduleRes.statusCode).toBe(200);
		expect(scheduleRes.body.schedule).toBeDefined();
		expect(Object.keys(scheduleRes.body.schedule).length).toBeGreaterThan(0);

		const reviewCreateRes = await request(app)
			.post('/api/reviews')
			.set(headers)
			.send({
				dateKey: '2026-05-11',
				sessionNumber: 1,
				sessionLabel: 'Session 1',
				correct: 2,
				partial: 1,
				incorrect: 0,
				noteId: noteRes.body.note.id,
			});

		expect(reviewCreateRes.statusCode).toBe(201);
		expect(reviewCreateRes.body.session).toMatchObject({
			dateKey: '2026-05-11',
			sessionNumber: 1,
			sessionLabel: 'Session 1',
		});

		const reviewListRes = await request(app)
			.get('/api/reviews')
			.set(headers);

		expect(reviewListRes.statusCode).toBe(200);
		expect(reviewListRes.body.sessions).toHaveLength(1);

		const scheduleListRes = await request(app)
			.get('/api/schedule')
			.set(headers);

		expect(scheduleListRes.statusCode).toBe(200);
		expect(scheduleListRes.body.schedule).toBeDefined();
	});

	test('a user can clear review history and review schedule data', async () => {
		const { headers } = await createUserAndAuthHeader({
			username: 'cleanup-student',
			email: 'cleanup-student@example.com',
		});

		await ReviewSession.create({
			userId: (await User.findOne({ email: 'cleanup-student@example.com' })).id,
			dateKey: '2026-05-11',
			sessionNumber: 1,
			sessionLabel: 'Session 1',
			correct: 1,
			partial: 0,
			incorrect: 0,
		});

		await ReviewSchedule.create({
			userId: (await User.findOne({ email: 'cleanup-student@example.com' })).id,
			dateKey: '2026-05-12',
			count: 1,
			noteId: null,
		});

		const clearReviewsRes = await request(app)
			.delete('/api/reviews')
			.set(headers);

		expect(clearReviewsRes.statusCode).toBe(200);
		expect(clearReviewsRes.body.message).toBe('Review sessions cleared.');

		const clearScheduleRes = await request(app)
			.delete('/api/schedule')
			.set(headers);

		expect(clearScheduleRes.statusCode).toBe(200);
		expect(clearScheduleRes.body.message).toBe('Review schedule cleared.');
	});
});
