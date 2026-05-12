const request = require('supertest');
const app = require('../app');
const {
	setupMongoTestDatabase,
	clearMongoTestDatabase,
	teardownMongoTestDatabase,
	createAuthHeader,
} = require('./mongoTestHelper');

jest.setTimeout(60000);

function formatDateKey(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function createExpectedSchedule(results) {
	const schedule = {};
	const today = new Date();

	results.forEach((item) => {
		let daysToAdd = 1;

		if (item.status === 'correct') {
			daysToAdd = 3;
		} else if (item.status === 'partial') {
			daysToAdd = 2;
		} else if (item.status === 'missing' || item.status === 'incorrect') {
			daysToAdd = 1;
		}

		const reviewDate = new Date(today);
		reviewDate.setDate(reviewDate.getDate() + daysToAdd);

		const dateKey = formatDateKey(reviewDate);
		schedule[dateKey] = (schedule[dateKey] || 0) + 1;
	});

	return schedule;
}

describe('MongoDB review tracking validation', () => {
	beforeAll(async () => {
		await setupMongoTestDatabase();
	});

	afterEach(async () => {
		await clearMongoTestDatabase();
	});

	afterAll(async () => {
		await teardownMongoTestDatabase();
	});

	describe('Progress tracker sessions', () => {
		test('stores and returns same-day review sessions with session labels', async () => {
			const auth = await createAuthHeader({ username: 'progress-user' });
			const todayKey = formatDateKey(new Date());

			const firstRes = await request(app)
				.post('/api/reviews')
				.set(auth.headers)
				.send({
					dateKey: todayKey,
					sessionNumber: 1,
					sessionLabel: 'Session 1',
					correct: 4,
					partial: 1,
					incorrect: 2,
				});

			expect(firstRes.statusCode).toBe(201);
			expect(firstRes.body.session).toMatchObject({
				dateKey: todayKey,
				sessionNumber: 1,
				sessionLabel: 'Session 1',
				correct: 4,
				partial: 1,
				incorrect: 2,
			});

			const secondRes = await request(app)
				.post('/api/reviews')
				.set(auth.headers)
				.send({
					dateKey: todayKey,
					sessionNumber: 2,
					sessionLabel: 'Session 2',
					correct: 5,
					partial: 0,
					incorrect: 1,
				});

			expect(secondRes.statusCode).toBe(201);
			expect(secondRes.body.session).toMatchObject({
				dateKey: todayKey,
				sessionNumber: 2,
				sessionLabel: 'Session 2',
				correct: 5,
				partial: 0,
				incorrect: 1,
			});

			const listRes = await request(app).get('/api/reviews').set(auth.headers);
			expect(listRes.statusCode).toBe(200);
			expect(Array.isArray(listRes.body.sessions)).toBe(true);
			expect(listRes.body.sessions).toHaveLength(2);
			expect(listRes.body.sessions[0]).toMatchObject({
				dateKey: todayKey,
				sessionNumber: 1,
				sessionLabel: 'Session 1',
			});
			expect(listRes.body.sessions[1]).toMatchObject({
				dateKey: todayKey,
				sessionNumber: 2,
				sessionLabel: 'Session 2',
			});
		});

		test('keeps review sessions isolated per user and supports clear-all', async () => {
			const ownerAuth = await createAuthHeader({ username: 'owner-progress-user' });
			const otherAuth = await createAuthHeader({ username: 'other-progress-user' });
			const todayKey = formatDateKey(new Date());

			await request(app)
				.post('/api/reviews')
				.set(ownerAuth.headers)
				.send({
					dateKey: todayKey,
					sessionNumber: 1,
					sessionLabel: 'Session 1',
					correct: 3,
					partial: 1,
					incorrect: 0,
				});

			await request(app)
				.post('/api/reviews')
				.set(otherAuth.headers)
				.send({
					dateKey: todayKey,
					sessionNumber: 1,
					sessionLabel: 'Session 1',
					correct: 2,
					partial: 0,
					incorrect: 2,
				});

			const ownerBeforeDelete = await request(app).get('/api/reviews').set(ownerAuth.headers);
			expect(ownerBeforeDelete.body.sessions).toHaveLength(1);

			const otherBeforeDelete = await request(app).get('/api/reviews').set(otherAuth.headers);
			expect(otherBeforeDelete.body.sessions).toHaveLength(1);

			const deleteRes = await request(app).delete('/api/reviews').set(ownerAuth.headers);
			expect(deleteRes.statusCode).toBe(200);

			const ownerAfterDelete = await request(app).get('/api/reviews').set(ownerAuth.headers);
			expect(ownerAfterDelete.body.sessions).toHaveLength(0);

			const otherAfterDelete = await request(app).get('/api/reviews').set(otherAuth.headers);
			expect(otherAfterDelete.body.sessions).toHaveLength(1);
		});
	});

	describe('Calendar schedule persistence', () => {
		test('stores generated schedule entries and returns an aggregated month map', async () => {
			const auth = await createAuthHeader({ username: 'calendar-user' });

			const results = [
				{ status: 'correct' },
				{ status: 'partial' },
				{ status: 'incorrect' },
				{ status: 'missing' },
			];

			const postRes = await request(app)
				.post('/api/schedule')
				.set(auth.headers)
				.send({ results, noteId: null });

			expect(postRes.statusCode).toBe(200);
		expect(postRes.body.schedule).toEqual(createExpectedSchedule(results));

			const getRes = await request(app).get('/api/schedule').set(auth.headers);
			expect(getRes.statusCode).toBe(200);
			expect(getRes.body.schedule).toEqual(createExpectedSchedule(results));
		});

		test('keeps calendar schedule isolated per user and supports clear-all', async () => {
			const ownerAuth = await createAuthHeader({ username: 'calendar-owner' });
			const otherAuth = await createAuthHeader({ username: 'calendar-other' });

			await request(app)
				.post('/api/schedule')
				.set(ownerAuth.headers)
				.send({ results: [{ status: 'correct' }, { status: 'partial' }] });

			await request(app)
				.post('/api/schedule')
				.set(otherAuth.headers)
				.send({ results: [{ status: 'incorrect' }] });

			const ownerBeforeDelete = await request(app).get('/api/schedule').set(ownerAuth.headers);
			const otherBeforeDelete = await request(app).get('/api/schedule').set(otherAuth.headers);
			expect(Object.keys(ownerBeforeDelete.body.schedule).length).toBeGreaterThan(0);
			expect(Object.keys(otherBeforeDelete.body.schedule).length).toBeGreaterThan(0);

			const deleteRes = await request(app).delete('/api/schedule').set(ownerAuth.headers);
			expect(deleteRes.statusCode).toBe(200);

			const ownerAfterDelete = await request(app).get('/api/schedule').set(ownerAuth.headers);
			expect(ownerAfterDelete.body.schedule).toEqual({});

			const otherAfterDelete = await request(app).get('/api/schedule').set(otherAuth.headers);
			expect(Object.keys(otherAfterDelete.body.schedule).length).toBeGreaterThan(0);
		});
	});
});
