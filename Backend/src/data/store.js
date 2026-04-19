const notes = [];
const folders = [];

let noteCounter = 1;
let folderCounter = 1;

// Initialize with Unsorted folder
const unsortedFolder = { id: 'unsorted', name: 'Unsorted', createdAt: new Date().toISOString(), isUnsorted: true };
folders.push(unsortedFolder);

function createFolder(name) {
  const folder = { id: String(folderCounter++), name: name.trim(), createdAt: new Date().toISOString() };
  folders.push(folder);
  return folder;
}

function listFolders() {
  return folders.map((folder) => {
    const noteCount = notes.filter((note) => note.folderId === folder.id).length;
    return { ...folder, noteCount };
  });
}

function renameFolder(folderId, newName) {
  if (folderId === 'unsorted') {
    return null; // Cannot rename Unsorted folder
  }
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) {
    return null;
  }
  folder.name = newName.trim();
  folder.updatedAt = new Date().toISOString();
  return folder;
}

function deleteFolder(folderId) {
  if (folderId === 'unsorted') {
    return false; // Cannot delete Unsorted folder
  }
  const folderIndex = folders.findIndex((f) => f.id === folderId);
  if (folderIndex === -1) {
    return false;
  }
  
  // Move all notes in this folder to Unsorted
  notes.forEach((note) => {
    if (note.folderId === folderId) {
      note.folderId = null; // This makes them appear in Unsorted
    }
  });
  
  folders.splice(folderIndex, 1);
  return true;
}

function deleteNote(noteId) {
  const noteIndex = notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    return false;
  }
  notes.splice(noteIndex, 1);
  return true;
}

function createNote({ title, content, folderId, summary = null }) {
  const note = {
    id: String(noteCounter++),
    title: title.trim(),
    content: content.trim(),
    folderId: folderId || null,
    summary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.push(note);
  return withFolderName(note);
}

function updateNoteFolder(noteId, folderId) {
  const note = notes.find((entry) => entry.id === noteId);
  if (!note) {
    return null;
  }

  note.folderId = folderId || null;
  note.updatedAt = new Date().toISOString();
  return withFolderName(note);
}

function getNoteById(noteId) {
  const note = notes.find((entry) => entry.id === noteId);
  return note ? withFolderName(note) : null;
}

function listNotes() {
  return notes.map(withFolderName);
}

function folderExists(folderId) {
  if (!folderId) {
    return true;
  }

  return folders.some((folder) => folder.id === folderId);
}

function withFolderName(note) {
  const folder = folders.find((entry) => entry.id === note.folderId);
  return { ...note, folderName: folder ? folder.name : null };
}

module.exports = {
  createFolder,
  listFolders,
  renameFolder,
  deleteFolder,
  deleteNote,
  createNote,
  updateNoteFolder,
  getNoteById,
  listNotes,
  folderExists,
};
