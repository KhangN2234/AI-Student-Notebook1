const Note = require('./Note');
const Folder = require('./Folder');

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

async function listNotes() {
	const notes = await Note.find().populate('folderId', 'name').sort({ createdAt: -1 });
	return notes.map(serializeNote);
}

async function getNoteById(noteId) {
	const note = await Note.findById(noteId).populate('folderId', 'name');
	return serializeNote(note);
}

async function createNote({ title, content, folderId = null, summary = null }) {
	const note = await Note.create({
		title,
		content,
		folderId: folderId || null,
		summary: summary || null,
	});

	return getNoteById(note.id);
}

async function updateNoteFolder(noteId, folderId) {
	const note = await Note.findByIdAndUpdate(
		noteId,
		{ folderId: folderId || null, updatedAt: new Date() },
		{ new: true, runValidators: true }
	).populate('folderId', 'name');

	return serializeNote(note);
}

async function deleteNote(noteId) {
	const result = await Note.findByIdAndDelete(noteId);
	return Boolean(result);
}

async function noteExists(noteId) {
	const count = await Note.countDocuments({ _id: noteId });
	return count > 0;
}

module.exports = {
	serializeNote,
	listNotes,
	getNoteById,
	createNote,
	updateNoteFolder,
	deleteNote,
	noteExists,
};
