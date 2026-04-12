const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {
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

module.exports = router;
