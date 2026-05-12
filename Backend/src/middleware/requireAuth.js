const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

async function requireAuth(req, res, next) {
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

	req.user = {
		id: user.id,
		email: user.email,
		username: user.username,
	};

	return next();
}

module.exports = requireAuth;
