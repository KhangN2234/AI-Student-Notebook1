const Note = require('./Note');
const Folder = require('./Folder');
const { isValidObjectId } = require('mongoose');

function serializeNote(noteDoc) {
	if (!noteDoc) {
		return null;
	}

	const note = typeof noteDoc.toObject === 'function' ? noteDoc.toObject() : { ...noteDoc };
	const folder = note.folderId && typeof note.folderId === 'object' ? note.folderId : null;

	return {
		...note,
		folderId: folder ? folder.id : note.folderId || null,
		folderName: folder ? folder.name : null,
	};
}

async function listNotes(userId) {
	const notes = await Note.find({ userId }).populate('folderId', 'name').sort({ createdAt: -1 });
	return notes.map(serializeNote);
}

async function getNoteById(noteId, userId) {
	if (!isValidObjectId(noteId)) {
		return null;
	}

	const note = await Note.findOne({ _id: noteId, userId }).populate('folderId', 'name');
	return serializeNote(note);
}

async function createNote({ userId, title, content, folderId = null, summary = null }) {
	const note = await Note.create({
		userId,
		title,
		content,
		folderId: folderId || null,
		summary: summary || null,
	});

	return getNoteById(note.id, userId);
}

async function updateNote(noteId, { userId, title, content, folderId = null, summary }) {
	if (!isValidObjectId(noteId)) {
		return null;
	}

	const updatePayload = {
		title,
		content,
		folderId: folderId || null,
		updatedAt: new Date(),
	};

	if (summary !== undefined) {
		updatePayload.summary = summary;
	}

	const note = await Note.findOneAndUpdate(
		{ _id: noteId, userId },
		updatePayload,
		{ returnDocument: 'after', runValidators: true }
	).populate('folderId', 'name');

	return serializeNote(note);
}

async function updateNoteFolder(noteId, folderId, userId) {
	if (!isValidObjectId(noteId)) {
		return null;
	}

	const note = await Note.findOneAndUpdate(
		{ _id: noteId, userId },
		{ folderId: folderId || null, updatedAt: new Date() },
		{ returnDocument: 'after', runValidators: true }
	).populate('folderId', 'name');

	return serializeNote(note);
}

async function deleteNote(noteId, userId) {
	if (!isValidObjectId(noteId)) {
		return false;
	}

	const result = await Note.findOneAndDelete({ _id: noteId, userId });
	return Boolean(result);
}

async function noteExists(noteId) {
	if (!isValidObjectId(noteId)) {
		return false;
	}

	const count = await Note.countDocuments({ _id: noteId });
	return count > 0;
}

module.exports = {
	serializeNote,
	listNotes,
	getNoteById,
	createNote,
	updateNote,
	updateNoteFolder,
	deleteNote,
	noteExists,
};
