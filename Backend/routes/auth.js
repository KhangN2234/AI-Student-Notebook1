const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../src/models/User');

const router = express.Router();

function getBearerToken(authorizationHeader) {
	if (!authorizationHeader || typeof authorizationHeader !== 'string') {
		return null;
	}

	const [scheme, token] = authorizationHeader.split(' ');
	if (scheme !== 'Bearer' || !token) {
		return null;
	}

	return token;
}

function createAuthPayload(user) {
	const secret = process.env.JWT_SECRET || 'dev-only-secret';
	const token = jwt.sign(
		{ sub: user.id, email: user.email, username: user.username },
		secret,
		{ expiresIn: '7d' }
	);

	return {
		token,
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
		},
	};
}

router.post('/signup', async (req, res) => {
	try {
		const { username, email, password } = req.body || {};
		const safeUsername = typeof username === 'string' ? username.trim() : '';
		const safeEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
		const safePassword = typeof password === 'string' ? password : '';

		if (!safeUsername || !safeEmail || !safePassword) {
			return res.status(400).json({ message: 'username, email, and password are required.' });
		}

		if (!validator.isEmail(safeEmail)) {
			return res.status(400).json({ message: 'Invalid email address.' });
		}

		if (safePassword.length < 8) {
			return res.status(400).json({ message: 'Password must be at least 8 characters.' });
		}

		const existingUser = await User.findOne({
			$or: [{ email: safeEmail }, { username: safeUsername }],
		});

		if (existingUser) {
			return res.status(409).json({ message: 'An account with that username or email already exists.' });
		}

		const passwordHash = await bcrypt.hash(safePassword, 10);
		const user = await User.create({
			username: safeUsername,
			email: safeEmail,
			passwordHash,
		});

		return res.status(201).json(createAuthPayload(user));
	} catch (error) {
		if (error?.code === 11000) {
			return res.status(409).json({ message: 'An account with that username or email already exists.' });
		}

		if (error?.name === 'ValidationError') {
			const firstIssue = Object.values(error.errors || {})[0]?.message;
			return res.status(400).json({ message: firstIssue || 'Invalid signup payload.' });
		}

		console.error('Error creating account:', error);
		return res.status(500).json({ message: 'Failed to create account.' });
	}
});

router.post('/login', async (req, res) => {
	const { identifier, password } = req.body || {};
	const safeIdentifier = typeof identifier === 'string' ? identifier.trim() : '';
	const safePassword = typeof password === 'string' ? password : '';

	if (!safeIdentifier || !safePassword) {
		return res.status(400).json({ message: 'identifier and password are required.' });
	}

	const query = safeIdentifier.includes('@')
		? { email: safeIdentifier.toLowerCase() }
		: { username: safeIdentifier };

	const user = await User.findOne(query);
	if (!user) {
		return res.status(401).json({ message: 'Invalid credentials.' });
	}

	const isValidPassword = await bcrypt.compare(safePassword, user.passwordHash);
	if (!isValidPassword) {
		return res.status(401).json({ message: 'Invalid credentials.' });
	}

	return res.json(createAuthPayload(user));
});

router.get('/me', async (req, res) => {
	const token = getBearerToken(req.headers.authorization);
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized.' });
	}

	const secret = process.env.JWT_SECRET || 'dev-only-secret';
	let payload;
	try {
		payload = jwt.verify(token, secret);
	} catch {
		return res.status(401).json({ message: 'Unauthorized.' });
	}

	const user = await User.findById(payload.sub);
	if (!user) {
		return res.status(401).json({ message: 'Unauthorized.' });
	}

	return res.json({
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
		},
	});
});

module.exports = router;
