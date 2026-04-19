const express = require('express');
const axios = require('axios');


const {
	createNote,
	folderExists,
	getNoteById,
	listNotes,
	updateNoteFolder,
	deleteNote,
} = require('../src/data/store');

const router = express.Router();

router.get('/', (_req, res) => {
	res.json({ notes: listNotes() });
});

// req is info from front end, res is what to send back
router.post('/', async (req, res) => {
	const { title, content, folderId, summarize, summary } = req.body || {};
	const safeTitle = typeof title === 'string' ? title.trim() : '';
	const safeContent = typeof content === 'string' ? content.trim() : '';

	if (!safeContent) {
		return res.status(400).json({ message: 'content is required.' });
	}

	if (summarize) {
		if (!process.env.GROQ_API_KEY) {
			return res.status(500).json({ message: 'Missing GROQ_API_KEY.' });
		}

		if (safeContent.length < 10) {
			return res.status(400).json({ message: 'Content too short to summarize.' });
		}

		try {
			const response = await axios.post(
				'https://api.groq.com/openai/v1/chat/completions',
				{
					model: 'llama-3.3-70b-versatile',
					messages: [
						{
							role: 'system',
							content: 'Summarize notes into clear bullet points.',
						},
						{
							role: 'user',
							content: safeContent,
						},
					],
					temperature: 0.5,
					max_tokens: 500,
				},
				{
					headers: {
						Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
						'Content-Type': 'application/json',
					},
				}
			);

			const summary = response.data.choices[0].message.content;

			// Return just the summary without saving the note
			return res.json({ summary });

		} catch (error) {
			console.error('Groq Error:', error.response?.data || error.message);
			return res.status(500).json({
				message: 'Failed to generate summary.',
			});
		}
	}

	// Normal Save (No summary)

	if (!safeTitle) {
		return res.status(400).json({ message: 'title is required.' });
	}

	if (folderId && !folderExists(folderId)) {
		return res.status(400).json({ message: 'Invalid folderId.' });
	}

	const note = createNote({
		title: safeTitle,
		content: safeContent,
		folderId,
		summary: summary || null,
	});

	// Return
	res.status(201).json({ note });
});


router.get('/:id', (req, res) => {
	const note = getNoteById(req.params.id);
	if (!note) {
		return res.status(404).json({ message: 'Note not found.' });
	}

	res.json({ note });
});
router.patch('/:id/folder', (req, res) => {
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

router.delete('/:id', (req, res) => {
	const success = deleteNote(req.params.id);
	if (!success) {
		return res.status(404).json({ message: 'Note not found.' });
	}

	res.json({ message: 'Note deleted successfully.' });
});

module.exports = router;
