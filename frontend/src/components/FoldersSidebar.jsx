import { useState, useEffect } from 'react';
import { getFolders, getNotes, createFolder, renameFolder, deleteFolder } from '../services/api';
import FolderItem from './FolderItem';
import './FoldersSidebar.css';

function FoldersSidebar({ selectedNoteId, onSelectNote }) {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Load folders and notes on mount
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
  }, []);

  // Toggle folder expanded state
  function handleToggleFolder(folderId) {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  }

  // Handle new folder creation
  async function handleCreateFolder() {
    if (!newFolderName.trim()) {
      return;
    }

    try {
      setIsCreatingFolder(true);
      const response = await createFolder({ name: newFolderName });
      const newFolder = response.folder || response;

      setFolders((prev) => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderInput(false);

      // Auto-expand the new folder
      setExpandedFolders((prev) => ({
        ...prev,
        [newFolder.id]: true,
      }));
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err.message || 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
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

  // Handle cancel new folder input
  function handleCancelNewFolder() {
    setShowNewFolderInput(false);
    setNewFolderName('');
  }

  if (loading) {
    return <div className="folders-sidebar loading">Loading folders...</div>;
  }

  // Create Unsorted virtual folder
  const unsortedNotes = notes.filter((n) => !n.folderId);
  const unsortedFolder = {
    id: 'unsorted',
    name: 'Unsorted',
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
          />
        ))}
      </div>

      {/* New Folder Input */}
      <div className="new-folder-section">
        {!showNewFolderInput ? (
          <button
            className="new-folder-button"
            onClick={() => setShowNewFolderInput(true)}
            disabled={isCreatingFolder}
          >
            + New Folder
          </button>
        ) : (
          <div className="new-folder-input-group">
            <input
              type="text"
              className="new-folder-input"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                } else if (e.key === 'Escape') {
                  handleCancelNewFolder();
                }
              }}
              autoFocus
              disabled={isCreatingFolder}
            />
            <button
              className="confirm-button"
              onClick={handleCreateFolder}
              disabled={isCreatingFolder || !newFolderName.trim()}
            >
              {isCreatingFolder ? '...' : '✓'}
            </button>
            <button
              className="cancel-button"
              onClick={handleCancelNewFolder}
              disabled={isCreatingFolder}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FoldersSidebar;
