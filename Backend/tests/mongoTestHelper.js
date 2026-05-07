const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectMongoDB, disconnectMongoDB } = require('../src/config/db');
const Note = require('../src/models/Note');
const Folder = require('../src/models/Folder');

let mongoServer;

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
}

async function teardownMongoTestDatabase() {
	await disconnectMongoDB();

	if (mongoServer) {
		await mongoServer.stop();
		mongoServer = null;
	}
}

module.exports = {
	setupMongoTestDatabase,
	clearMongoTestDatabase,
	teardownMongoTestDatabase,
};
