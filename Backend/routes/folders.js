const express = require('express');
const { createFolder, listFolders } = require('../src/data/store');

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

module.exports = router;
