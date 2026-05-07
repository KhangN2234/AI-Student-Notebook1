const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

	const secret = process.env.JWT_SECRET || 'dev-only-secret';
	const token = jwt.sign(
		{ sub: user.id, email: user.email, username: user.username },
		secret,
		{ expiresIn: '7d' }
	);

	return res.json({
		token,
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
		},
	});
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
