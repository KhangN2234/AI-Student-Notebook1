const { Types } = require('mongoose');
const ReviewSchedule = require('./ReviewSchedule');

function serializeReviewSchedule(entryDoc) {
	if (!entryDoc) {
		return null;
	}

	const entry = typeof entryDoc.toObject === 'function' ? entryDoc.toObject() : { ...entryDoc };
	return entry;
}

async function listReviewSchedule(userId) {
	const entries = await ReviewSchedule.find({ userId }).sort({ dateKey: 1, createdAt: 1 });
	const schedule = {};

	entries.forEach((entry) => {
		const key = entry.dateKey;
		schedule[key] = (schedule[key] || 0) + Number(entry.count || 0);
	});

	return schedule;
}

async function createReviewScheduleEntries(schedule, userId, noteId = null) {
	const entries = Object.entries(schedule || {})
		.filter(([, count]) => Number(count) > 0)
		.map(([dateKey, count]) => ({
			userId,
			dateKey,
			count: Number(count),
			noteId,
		}));

	if (entries.length === 0) {
		return [];
	}

	const created = await ReviewSchedule.insertMany(entries);
	return created.map(serializeReviewSchedule);
}

async function clearReviewSchedule(userId) {
	const result = await ReviewSchedule.deleteMany({ userId });
	return result.deletedCount || 0;
}

module.exports = {
	serializeReviewSchedule,
	listReviewSchedule,
	createReviewScheduleEntries,
	clearReviewSchedule,
};