const { isValidObjectId, Types } = require('mongoose');
const ReviewSession = require('./ReviewSession');

function serializeReviewSession(sessionDoc) {
	if (!sessionDoc) {
		return null;
	}

	const session = typeof sessionDoc.toObject === 'function' ? sessionDoc.toObject() : { ...sessionDoc };

	return session;
}

async function listReviewSessions(userId) {
	const sessions = await ReviewSession.find({ userId }).sort({ dateKey: 1, sessionNumber: 1, createdAt: 1 });
	return sessions.map(serializeReviewSession);
}

async function createReviewSession(data, userId) {
	const session = await ReviewSession.create({
		userId,
		noteId: isValidObjectId(data.noteId) ? new Types.ObjectId(data.noteId) : null,
		dateKey: data.dateKey,
		sessionNumber: Number(data.sessionNumber) || 1,
		sessionLabel: data.sessionLabel || `Session ${Number(data.sessionNumber) || 1}`,
		correct: Number(data.correct) || 0,
		partial: Number(data.partial) || 0,
		incorrect: Number(data.incorrect) || 0,
	});

	return serializeReviewSession(session);
}

async function clearReviewSessions(userId) {
	const result = await ReviewSession.deleteMany({ userId });
	return result.deletedCount || 0;
}

module.exports = {
	serializeReviewSession,
	listReviewSessions,
	createReviewSession,
	clearReviewSessions,
};