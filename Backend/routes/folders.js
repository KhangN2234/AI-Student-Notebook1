const express = require('express');
const {
  createFolder,
  listFolders,
  renameFolder,
  deleteFolder,
} = require('../src/models/folderRepository');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const folders = await listFolders(req.user.id);
    res.json({ folders });
  } catch (error) {
    console.error('Error listing folders:', error);
    res.status(500).json({ message: 'Failed to load folders.' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Folder name is required.' });
  }

 	try {
    const folder = await createFolder(name, req.user.id);
    return res.status(201).json({ folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    return res.status(500).json({ message: 'Failed to create folder.' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};

 	if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Folder name is required.' });
  }

 	if (id === 'unsorted') {
    return res.status(400).json({ message: 'Cannot rename the Unsorted folder.' });
  }

 	try {
    const updatedFolder = await renameFolder(id, name, req.user.id);
    if (!updatedFolder) {
      return res.status(404).json({ message: 'Folder not found.' });
    }

 		return res.json({ folder: updatedFolder });
  } catch (error) {
    console.error('Error renaming folder:', error);
    return res.status(500).json({ message: 'Failed to rename folder.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

 	if (id === 'unsorted') {
    return res.status(400).json({ message: 'Cannot delete the Unsorted folder.' });
  }

 	try {
    const success = await deleteFolder(id, req.user.id);
    if (!success) {
      return res.status(404).json({ message: 'Folder not found.' });
    }

 		return res.json({ message: 'Folder deleted successfully.' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return res.status(500).json({ message: 'Failed to delete folder.' });
  }
});

module.exports = router;
