const express = require('express');
const axios = require('axios');

const {
  createNote,
  getNoteById,
  listNotes,
  updateNoteFolder,
  deleteNote,
} = require('../src/models/noteRepository');
const { folderExists } = require('../src/models/folderRepository');

const router = express.Router();

router.get('/', async (_req, res) => {
	try {
		const notes = await listNotes();
		res.json({ notes });
	} catch (error) {
		console.error('Error listing notes:', error);
		res.status(500).json({ message: 'Failed to load notes.' });
	}
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
							content: 'Summarize notes into clear bullet points. Do not write anything extra like "Here is the note summarize", etc',
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

	if (folderId && !(await folderExists(folderId))) {
		return res.status(400).json({ message: 'Invalid folderId.' });
	}

	try {
		const note = await createNote({
			title: safeTitle,
			content: safeContent,
			folderId,
			summary: summary || null,
		});

		res.status(201).json({ note });
	} catch (error) {
		console.error('Error creating note:', error);
		res.status(500).json({ message: 'Failed to create note.' });
	}
});


router.get('/:id', async (req, res) => {
	try {
		const note = await getNoteById(req.params.id);
		if (!note) {
			return res.status(404).json({ message: 'Note not found.' });
		}

		res.json({ note });
	} catch (error) {
		console.error('Error loading note:', error);
		res.status(500).json({ message: 'Failed to load note.' });
	}
});
router.patch('/:id/folder', async (req, res) => {
	const { folderId } = req.body || {};
	if (folderId && !(await folderExists(folderId))) {
		return res.status(400).json({ message: 'Invalid folderId.' });
	}

	try {
		const note = await updateNoteFolder(req.params.id, folderId || null);
		if (!note) {
			return res.status(404).json({ message: 'Note not found.' });
		}

		res.json({ note });
	} catch (error) {
		console.error('Error updating note folder:', error);
		res.status(500).json({ message: 'Failed to update note folder.' });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const success = await deleteNote(req.params.id);
		if (!success) {
			return res.status(404).json({ message: 'Note not found.' });
		}

		res.json({ message: 'Note deleted successfully.' });
	} catch (error) {
		console.error('Error deleting note:', error);
		res.status(500).json({ message: 'Failed to delete note.' });
	}
});

module.exports = router;
