const express = require('express');
const axios = require('axios');


const {
	createNote,
	folderExists,
	getNoteById,
	listNotes,
	updateNoteFolder,
} = require('../src/data/store');

const router = express.Router();

router.get('/', (_req, res) => {
	res.json({ notes: listNotes() });
});

router.post('/', async (req, res) => {
	const { title, content, folderId, summarize } = req.body || {};
	const safeTitle = typeof title === 'string' ? title.trim() : '';
	const safeContent = typeof content === 'string' ? content.trim() : '';

    // Checking for user errors
	if (!safeTitle || !safeContent) {
		return res.status(400).json({ message: 'title and content are required.' });
	}
	if (folderId && !folderExists(folderId)) {
		return res.status(400).json({ message: 'Invalid folderId.' });
	}
	let summary = null;

    

	// Only call Groq if summarize flag is true
	if (summarize) {
        if (!process.env.GROQ_API_KEY) {
			return res.status(500).json({ message: 'Missing GROQ_API_KEY in environment.' });
		}
		if (safeContent.length < 10) {
			return res.status(400).json({ message: `Content too short to summarize (length: ${safeContent.length}).` });
        }
		if (safeContent.length > 6001) {
			return res.status(400).json({ message: 'Content too big, please break it into smaller parts.' });
        }
		

		try {
			const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama3-70b-8192',
                messages: [
                {
                    role: 'system',
                    content: 'Summarize notes clearly in bullet points.',
                },
                {
                    role: 'user',
                    content,
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

			summary = response.data.choices[0].message.content;
		} catch (error) {
			console.error('Groq API Error:', error.response?.data || error.message);
			// You can choose: fail OR continue without summary
			return res.status(500).json({
				message: 'Failed to generate summary, please wait one minute and try again.',
			});
            
		}
	}

	const note = createNote({
		title: safeTitle,
		content: safeContent,
		folderId,
		summary,
	});

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

module.exports = router;
