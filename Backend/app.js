require('dotenv').config();

const cors = require('cors');
const express = require('express');
const healthRoutes = require('./routes/health');
const notesRoutes = require('./routes/notes');
const foldersRoutes = require('./routes/folders');
const questionsRoutes = require('./routes/questions');

const app = express();

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
			if (isLocalhost) return callback(null, true);
			if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) return callback(null, true);
			return callback(new Error('CORS not allowed'));
		},
	})
);
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/questions', questionsRoutes);

app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).json({ message: 'Internal server error.' });
});

module.exports = app;
