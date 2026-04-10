const notes = [];
const folders = [];

let noteCounter = 1;
let folderCounter = 1;

function createFolder(name) {
  const folder = { id: String(folderCounter++), name: name.trim() };
  folders.push(folder);
  return folder;
}

function listFolders() {
  return folders.map((folder) => {
    const noteCount = notes.filter((note) => note.folderId === folder.id).length;
    return { ...folder, noteCount };
  });
}

function createNote({ title, content, folderId }) {
  const note = {
    id: String(noteCounter++),
    title: title.trim(),
    content: content.trim(),
    folderId: folderId || null,
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
  createNote,
  updateNoteFolder,
  getNoteById,
  listNotes,
  folderExists,
};
