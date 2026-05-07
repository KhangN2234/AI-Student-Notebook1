const app = require('./app');
const { connectMongoDB } = require('./src/config/db');
const port = process.env.PORT || 4000;

async function startServer() {
	try {
		await connectMongoDB();
		app.listen(port, () => {
			console.log(`Backend API running on http://localhost:${port}`);
		});
	} catch (error) {
		console.error('Failed to connect to MongoDB:', error.message);
		process.exit(1);
	}
}

startServer();
