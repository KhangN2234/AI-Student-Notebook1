const dns = require('node:dns');
const mongoose = require('mongoose');

dns.setServers(['1.1.1.1', '1.0.0.1']);


async function connectMongoDB() {
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		throw new Error('Missing MONGODB_URI environment variable.');
	}

	if (mongoose.connection.readyState === 1) {
		return mongoose.connection;
	}

	await mongoose.connect(uri, {
		serverSelectionTimeoutMS: 5000,
	});

	return mongoose.connection;
}

async function disconnectMongoDB() {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
	}
}

module.exports = {
	connectMongoDB,
	disconnectMongoDB,
};
