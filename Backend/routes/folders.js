const express = require('express');
const { createFolder, listFolders, renameFolder, deleteFolder } = require('../src/data/store');

const router = express.Router();

router.get('/', (_req, res) => {
	res.json({ folders: listFolders() });
});

router.post('/', (req, res) => {
	const { name } = req.body || {};
	if (!name || !name.trim()) {
		return res.status(400).json({ message: 'Folder name is required.' });
	}

	const folder = createFolder(name);
	res.status(201).json({ folder });
});

router.patch('/:id', (req, res) => {
	const { id } = req.params;
	const { name } = req.body || {};

	if (!name || !name.trim()) {
		return res.status(400).json({ message: 'Folder name is required.' });
	}

	if (id === 'unsorted') {
		return res.status(400).json({ message: 'Cannot rename the Unsorted folder.' });
	}

	const updatedFolder = renameFolder(id, name);
	if (!updatedFolder) {
		return res.status(404).json({ message: 'Folder not found.' });
	}

	res.json({ folder: updatedFolder });
});

router.delete('/:id', (req, res) => {
	const { id } = req.params;

	if (id === 'unsorted') {
		return res.status(400).json({ message: 'Cannot delete the Unsorted folder.' });
	}

	const success = deleteFolder(id);
	if (!success) {
		return res.status(404).json({ message: 'Folder not found.' });
	}

	res.json({ message: 'Folder deleted successfully.' });
});

module.exports = router;
