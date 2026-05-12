const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../src/models/User');
const {
	setupMongoTestDatabase,
	clearMongoTestDatabase,
	teardownMongoTestDatabase,
} = require('./mongoTestHelper');

beforeAll(async () => {
	await setupMongoTestDatabase();
});

afterEach(async () => {
	await clearMongoTestDatabase();
});

afterAll(async () => {
	await teardownMongoTestDatabase();
});

describe('POST /api/auth/signup', () => {
	test('creates an account and returns auth payload', async () => {
		const res = await request(app)
			.post('/api/auth/signup')
			.send({ username: 'newstudent', email: 'newstudent@example.com', password: 'Password123!' });

		expect(res.statusCode).toBe(201);
		expect(res.body.token).toBeDefined();
		expect(res.body.user).toMatchObject({
			username: 'newstudent',
			email: 'newstudent@example.com',
		});

		const user = await User.findOne({ email: 'newstudent@example.com' });
		expect(user).toBeDefined();
		expect(user.passwordHash).toBeDefined();
		expect(user.passwordHash).not.toBe('Password123!');
	});

	test('rejects duplicate username or email', async () => {
		const passwordHash = await bcrypt.hash('Password123!', 10);
		await User.create({ username: 'dupeuser', email: 'dupe@example.com', passwordHash });

		const res = await request(app)
			.post('/api/auth/signup')
			.send({ username: 'dupeuser', email: 'dupe2@example.com', password: 'Password123!' });

		expect(res.statusCode).toBe(409);
	});

	test('returns 400 for invalid signup payload', async () => {
		const res = await request(app)
			.post('/api/auth/signup')
			.send({ username: '', email: 'not-an-email', password: '123' });

		expect(res.statusCode).toBe(400);
		expect(res.body.message).toBeDefined();
	});
});

describe('POST /api/auth/login', () => {
	test('logs in with valid username and password', async () => {
		const passwordHash = await bcrypt.hash('Password123!', 10);
		await User.create({ username: 'student1', email: 'student1@example.com', passwordHash });

		const res = await request(app)
			.post('/api/auth/login')
			.send({ identifier: 'student1', password: 'Password123!' });

		expect(res.statusCode).toBe(200);
		expect(res.body.token).toBeDefined();
		expect(res.body.user).toMatchObject({
			username: 'student1',
			email: 'student1@example.com',
		});
	});

	test('rejects invalid password', async () => {
		const passwordHash = await bcrypt.hash('Password123!', 10);
		await User.create({ username: 'student2', email: 'student2@example.com', passwordHash });

		const res = await request(app)
			.post('/api/auth/login')
			.send({ identifier: 'student2', password: 'wrong-pass' });

		expect(res.statusCode).toBe(401);
		expect(res.body.message).toBe('Invalid credentials.');
	});

	test('returns 400 for missing fields', async () => {
		const res = await request(app).post('/api/auth/login').send({ identifier: '' });
		expect(res.statusCode).toBe(400);
	});
});

describe('GET /api/auth/me', () => {
	test('returns current user with valid bearer token', async () => {
		const passwordHash = await bcrypt.hash('Password123!', 10);
		await User.create({ username: 'student3', email: 'student3@example.com', passwordHash });

		const loginRes = await request(app)
			.post('/api/auth/login')
			.send({ identifier: 'student3@example.com', password: 'Password123!' });

		const meRes = await request(app)
			.get('/api/auth/me')
			.set('Authorization', `Bearer ${loginRes.body.token}`);

		expect(meRes.statusCode).toBe(200);
		expect(meRes.body.user).toMatchObject({
			username: 'student3',
			email: 'student3@example.com',
		});
	});

	test('returns 401 without token', async () => {
		const res = await request(app).get('/api/auth/me');
		expect(res.statusCode).toBe(401);
	});
});
