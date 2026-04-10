require('dotenv').config();

const cors = require('cors');
const express = require('express');
const {
	createFolder,
	createNote,
	folderExists,
	getNoteById,
	listFolders,
	listNotes,
	updateNoteFolder,
} = require('./src/data/store');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
	res.json({ ok: true });
});

app.get('/api/notes', (_req, res) => {
	res.json({ notes: listNotes() });
});

app.get('/api/notes/:id', (req, res) => {
	const note = getNoteById(req.params.id);
	if (!note) {
		return res.status(404).json({ message: 'Note not found.' });
	}

	res.json({ note });
});

app.post('/api/notes', (req, res) => {
	const { title, content, folderId } = req.body || {};
	if (!title || !content) {
		return res.status(400).json({ message: 'title and content are required.' });
	}

	if (folderId && !folderExists(folderId)) {
		return res.status(400).json({ message: 'Invalid folderId.' });
	}

	const note = createNote({ title, content, folderId });
	res.status(201).json({ note });
});

app.patch('/api/notes/:id/folder', (req, res) => {
	const { folderId } = req.body || {};
	if (folderId && !folderExists(folderId)) {
		return res.status(400).json({ message: 'Invalid folderId.' });
	}

	const note = updateNoteFolder(req.params.id, folderId || null);
	if (!note) {
		return res.status(404).json({ message: 'Note not found.' });
	}

	res.json({ note });
});

app.get('/api/folders', (_req, res) => {
	res.json({ folders: listFolders() });
});

app.post('/api/folders', (req, res) => {
	const { name } = req.body || {};
	if (!name || !name.trim()) {
		return res.status(400).json({ message: 'Folder name is required.' });
	}

	const folder = createFolder(name);
	res.status(201).json({ folder });
});

app.post('/api/summaries', (req, res) => {
	const { content } = req.body || {};
	if (!content || !content.trim()) {
		return res.status(400).json({ message: 'Note content is required.' });
	}

	const clean = content.trim();
	const clipped = clean.length > 420 ? `${clean.slice(0, 420)}...` : clean;
	const summary = `Overview:\n${clipped}\n\nKey takeaway: Focus on the main concepts and review weak spots.`;
	res.json({ summary });
});

app.post('/api/questions', (req, res) => {
	const { content } = req.body || {};
	if (!content || !content.trim()) {
		return res.status(400).json({ message: 'Note content is required.' });
	}

	const words = content
		.replace(/[^a-zA-Z0-9\s]/g, ' ')
		.toLowerCase()
		.split(/\s+/)
		.filter((word) => word.length >= 5);

	const unique = [...new Set(words)].slice(0, 5);
	const questions = unique.length
		? unique.map((word, index) => `${index + 1}. Explain the role of "${word}" in this note.`)
		: [
				'1. What are the three most important ideas in this note?',
				'2. How would you teach this topic to a classmate?',
				'3. Which part needs more evidence or examples?',
			];

	res.json({ questions });
});

app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).json({ message: 'Internal server error.' });
});

app.listen(port, () => {
	console.log(`Backend API running on http://localhost:${port}`);
});
