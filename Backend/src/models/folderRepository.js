const Folder = require('./Folder');
const Note = require('./Note');
const { isValidObjectId } = require('mongoose');

function serializeFolder(folderDoc, noteCount = 0) {
	if (!folderDoc) {
		return null;
	}

	const folder = typeof folderDoc.toObject === 'function' ? folderDoc.toObject() : { ...folderDoc };

	return {
		...folder,
		noteCount,
	};
}

async function listFolders() {
	const folders = await Folder.find().sort({ createdAt: 1 });

	const noteCounts = await Note.aggregate([
		{ $match: { folderId: { $ne: null } } },
		{ $group: { _id: '$folderId', noteCount: { $sum: 1 } } },
	]);

	const noteCountMap = new Map(noteCounts.map((entry) => [String(entry._id), entry.noteCount]));

	return folders.map((folder) => serializeFolder(folder, noteCountMap.get(String(folder.id)) || 0));
}

async function getFolderById(folderId) {
	if (!isValidObjectId(folderId)) {
		return null;
	}

	const folder = await Folder.findById(folderId);
	if (!folder) {
		return null;
	}

	const noteCount = await Note.countDocuments({ folderId: folder.id });
	return serializeFolder(folder, noteCount);
}

async function createFolder(name) {
	const folder = await Folder.create({ name });
	return serializeFolder(folder, 0);
}

async function renameFolder(folderId, newName) {
	if (!isValidObjectId(folderId)) {
		return null;
	}

	const folder = await Folder.findByIdAndUpdate(
		folderId,
		{ name: newName, updatedAt: new Date() },
		{ returnDocument: 'after', runValidators: true }
	);

	if (!folder) {
		return null;
	}

	const noteCount = await Note.countDocuments({ folderId: folder.id });
	return serializeFolder(folder, noteCount);
}

async function deleteFolder(folderId) {
	if (!isValidObjectId(folderId)) {
		return false;
	}

	const folder = await Folder.findByIdAndDelete(folderId);
	if (!folder) {
		return false;
	}

	await Note.updateMany(
		{ folderId: folder.id },
		{ $set: { folderId: null, updatedAt: new Date() } }
	);

	return true;
}

async function folderExists(folderId) {
	if (!folderId) {
		return true;
	}

	if (!isValidObjectId(folderId)) {
		return false;
	}

	const count = await Folder.countDocuments({ _id: folderId });
	return count > 0;
}

module.exports = {
	serializeFolder,
	listFolders,
	getFolderById,
	createFolder,
	renameFolder,
	deleteFolder,
	folderExists,
};
