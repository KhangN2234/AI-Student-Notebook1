const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectMongoDB, disconnectMongoDB } = require('../src/config/db');
const Note = require('../src/models/Note');
const Folder = require('../src/models/Folder');
const User = require('../src/models/User');

let mongoServer;
let userCounter = 0;

async function setupMongoTestDatabase() {
	if (!mongoServer) {
		mongoServer = await MongoMemoryServer.create();
		process.env.MONGODB_URI = mongoServer.getUri('student-notebook-test');
	}

	await connectMongoDB();
}

async function clearMongoTestDatabase() {
	await Note.deleteMany({});
	await Folder.deleteMany({});
	await User.deleteMany({});
}

async function teardownMongoTestDatabase() {
	await disconnectMongoDB();

	if (mongoServer) {
		await mongoServer.stop();
		mongoServer = null;
	}
}

async function createAuthHeader(overrides = {}) {
	userCounter += 1;
	const username = overrides.username || `testuser${userCounter}`;
	const email = overrides.email || `${username}@example.com`;
	const password = overrides.password || 'Password123!';
	const passwordHash = await bcrypt.hash(password, 10);

	const user = await User.create({ username, email, passwordHash });
	const secret = process.env.JWT_SECRET || 'dev-only-secret';
	const token = jwt.sign(
		{ sub: user.id, email: user.email, username: user.username },
		secret,
		{ expiresIn: '7d' }
	);

	return {
		headers: { Authorization: `Bearer ${token}` },
		user,
		password,
	};
}

module.exports = {
	setupMongoTestDatabase,
	clearMongoTestDatabase,
	teardownMongoTestDatabase,
	createAuthHeader,
};
