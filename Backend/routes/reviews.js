const express = require('express');
const requireAuth = require('../src/middleware/requireAuth');
const {
	listReviewSessions,
	createReviewSession,
	clearReviewSessions,
} = require('../src/models/reviewSessionRepository');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
	try {
		const sessions = await listReviewSessions(req.user.id);
		res.json({ sessions });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to load review sessions.' });
	}
});

router.post('/', async (req, res) => {
	const { dateKey, sessionNumber, sessionLabel, correct, partial, incorrect, noteId } = req.body || {};

	if (!dateKey) {
		return res.status(400).json({ message: 'dateKey is required.' });
	}

	try {
		const session = await createReviewSession(
			{ dateKey, sessionNumber, sessionLabel, correct, partial, incorrect, noteId },
			req.user.id
		);
		res.status(201).json({ session });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to save review session.' });
	}
});

router.delete('/', async (req, res) => {
	try {
		await clearReviewSessions(req.user.id);
		res.json({ message: 'Review sessions cleared.' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Failed to clear review sessions.' });
	}
});

module.exports = router;