import { useState, useEffect } from 'react';
import { getFolders, getNotes, renameFolder, deleteFolder, deleteNote } from '../services/api';
import FolderItem from './FolderItem';
import './FoldersSidebar.css';

function FoldersSidebar({ selectedNoteId, onSelectNote, refreshKey = 0 }) {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load folders and notes on mount and when externally refreshed
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [foldersRes, notesRes] = await Promise.all([
          getFolders(),
          getNotes(),
        ]);

        // getFolders returns { folders: [...] }
        const foldersList = Array.isArray(foldersRes) 
          ? foldersRes 
          : foldersRes.folders || [];
        
        // getNotes returns { notes: [...] }
        const notesList = Array.isArray(notesRes)
          ? notesRes
          : notesRes.notes || [];

        setFolders(foldersList);
        setNotes(notesList);

        // Auto-expand Unsorted folder (if it has notes)
        const unsortedFolder = foldersList.find((f) => f.id === 'unsorted');
        if (unsortedFolder) {
          setExpandedFolders((prev) => ({ ...prev, unsorted: true }));
        }
      } catch (err) {
        setError(err.message || 'Failed to load folders');
        console.error('Error loading folders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [refreshKey]);

  // Toggle folder expanded state
  function handleToggleFolder(folderId) {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  }

  // Handle folder rename
  async function handleRenameFolder(folderId, newName) {
    try {
      const response = await renameFolder(folderId, newName);
      const renamedFolder = response.folder || response;

      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, ...renamedFolder } : f))
      );
    } catch (err) {
      console.error('Error renaming folder:', err);
      setError(err.message || 'Failed to rename folder');
      throw err;
    }
  }

  // Handle folder delete
  async function handleDeleteFolder(folderId) {
    try {
      await deleteFolder(folderId);
      
      // Remove folder from state
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      
      // Reset expanded state for this folder
      setExpandedFolders((prev) => {
        const next = { ...prev };
        delete next[folderId];
        return next;
      });

      // Reload notes (they may have been moved to Unsorted)
      const notesRes = await getNotes();
      const notesList = Array.isArray(notesRes) ? notesRes : notesRes.notes || [];
      setNotes(notesList);
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError(err.message || 'Failed to delete folder');
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (selectedNoteId === noteId) {
        onSelectNote(null);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err.message || 'Failed to delete note');
      throw err;
    }
  }

  if (loading) {
    return <div className="folders-sidebar loading">Loading folders...</div>;
  }

  // Create Unsorted virtual folder
  const unsortedNotes = notes.filter((n) => !n.folderId);
  const unsortedFolder = {
    id: 'unsorted',
    name: 'Unsorted Notes',
    isUnsorted: true,
  };

  // Sort regular folders by creation date (oldest first)
  const regularFolders = folders
    .filter((f) => f.id !== 'unsorted')
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateA - dateB;
    });

  return (
    <div className="folders-sidebar">
      {error && <div className="sidebar-error">{error}</div>}

      <div className="folders-list">
        {/* Unsorted folder (always visible and auto-expanded) */}
        <FolderItem
          folder={unsortedFolder}
          isExpanded={expandedFolders.unsorted ?? true}
          onToggle={handleToggleFolder}
          onSelectNote={onSelectNote}
          selectedNoteId={selectedNoteId}
          notes={unsortedNotes}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onDeleteNote={handleDeleteNote}
        />

        {/* Regular folders */}
        {regularFolders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isExpanded={expandedFolders[folder.id] ?? false}
            onToggle={handleToggleFolder}
            onSelectNote={onSelectNote}
            selectedNoteId={selectedNoteId}
            notes={notes}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onDeleteNote={handleDeleteNote}
          />
        ))}
      </div>

    </div>
  );
}

export default FoldersSidebar;
