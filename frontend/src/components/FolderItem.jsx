import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FolderItem.css';

function FolderItem({
  folder,
  isExpanded,
  onToggle,
  onSelectNote,
  selectedNoteId,
  notes,
  onRenameFolder,
  onDeleteFolder,
  onDeleteNote,
  onMoveNote,
}) {
  const navigate = useNavigate();
  const [focusedNoteIndex, setFocusedNoteIndex] = useState(-1);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showNoteMenu, setShowNoteMenu] = useState(false);
  const [noteMenuPosition, setNoteMenuPosition] = useState({ x: 0, y: 0 });
  const [noteMenuTargetId, setNoteMenuTargetId] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [renamingName, setRenamingName] = useState(folder.name);
  const menuRef = useRef(null);
  const noteMenuRef = useRef(null);

  useEffect(() => {
    if (!showMenu && !showNoteMenu) {
      return;
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (noteMenuRef.current && !noteMenuRef.current.contains(event.target)) {
        setShowNoteMenu(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowMenu(false);
        setShowNoteMenu(false);
      }
    }

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu, showNoteMenu]);

  // Filter notes for this folder
  const isUnsorted = folder.isUnsorted === true;
  const folderNotes = isUnsorted
    ? notes
    : notes.filter((note) => note.folderId === folder.id);

  // Handle folder click to expand/collapse
  function handleFolderClick() {
    setShowMenu(false);
    setShowNoteMenu(false);
    onToggle(folder.id);
  }

  function handleFolderDragOver(event) {
    if (!onMoveNote) {
      return;
    }

    const transferTypes = Array.from(event.dataTransfer.types || []);
    const hasNotePayload =
      transferTypes.includes('application/x-note-id') || transferTypes.includes('text/plain');

    if (!hasNotePayload) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
  }

  function handleFolderDragLeave() {
    setIsDropTarget(false);
  }

  async function handleFolderDrop(event) {
    if (!onMoveNote) {
      return;
    }

    event.preventDefault();
    setIsDropTarget(false);

    const draggedNoteId =
      event.dataTransfer.getData('application/x-note-id') ||
      event.dataTransfer.getData('text/plain');
    const sourceFolderIdRaw = event.dataTransfer.getData('application/x-note-folder-id');
    if (!draggedNoteId) {
      return;
    }

    const sourceFolderId =
      sourceFolderIdRaw && sourceFolderIdRaw !== '__UNSORTED__'
        ? sourceFolderIdRaw
        : null;
    const targetFolderId = isUnsorted ? null : folder.id;

    if (sourceFolderId === targetFolderId) {
      return;
    }

    await onMoveNote(draggedNoteId, targetFolderId);
  }

  function handleNoteDragStart(event, note) {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-note-id', note.id);
    event.dataTransfer.setData('text/plain', note.id);
    event.dataTransfer.setData(
      'application/x-note-folder-id',
      note.folderId || '__UNSORTED__'
    );
    setShowMenu(false);
    setShowNoteMenu(false);
  }

  function handleNoteDragEnd() {
    setIsDropTarget(false);
  }

  function handleFolderContextMenu(event) {
    if (isUnsorted) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const MENU_WIDTH = 130;
    const MENU_HEIGHT = 84;
    const viewportPadding = 8;

    const x = Math.min(
      event.clientX,
      window.innerWidth - MENU_WIDTH - viewportPadding
    );
    const y = Math.min(
      event.clientY,
      window.innerHeight - MENU_HEIGHT - viewportPadding
    );

    setMenuPosition({
      x: Math.max(viewportPadding, x),
      y: Math.max(viewportPadding, y),
    });
    setShowNoteMenu(false);
    setShowMenu(true);
  }

  function handleNoteContextMenu(event, noteId) {
    event.preventDefault();
    event.stopPropagation();

    const MENU_WIDTH = 180;
    const MENU_HEIGHT = 120;
    const viewportPadding = 8;

    const x = Math.min(
      event.clientX,
      window.innerWidth - MENU_WIDTH - viewportPadding
    );
    const y = Math.min(
      event.clientY,
      window.innerHeight - MENU_HEIGHT - viewportPadding
    );

    setNoteMenuPosition({
      x: Math.max(viewportPadding, x),
      y: Math.max(viewportPadding, y),
    });
    setNoteMenuTargetId(noteId);
    setShowMenu(false);
    setShowNoteMenu(true);
  }

  // Handle keyboard navigation within folder
  function handleFolderKeyDown(event) {
    // If expanded, allow arrow down to focus first note
    if (isExpanded && event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedNoteIndex(0);
    }
    // Enter key toggles expand/collapse
    if (event.key === 'Enter') {
      event.preventDefault();
      onToggle(folder.id);
    }
  }

  // Handle keyboard navigation within notes list
  function handleNoteKeyDown(event, index) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (index < folderNotes.length - 1) {
        setFocusedNoteIndex(index + 1);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index > 0) {
        setFocusedNoteIndex(index - 1);
      } else {
        // Arrow up from first note goes back to folder
        setFocusedNoteIndex(-1);
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onSelectNote(folderNotes[index].id);
    }
  }

  // Handle rename start
  function handleRenameStart(event) {
    event.stopPropagation();
    setIsRenaming(true);
    setShowMenu(false);
  }

  // Handle rename submit
  async function handleRenameSubmit() {
    if (renamingName.trim() && renamingName !== folder.name) {
      try {
        await onRenameFolder(folder.id, renamingName);
      } catch (err) {
        console.error('Error renaming folder:', err);
      }
    }
    setIsRenaming(false);
    setRenamingName(folder.name);
  }

  // Handle rename cancel
  function handleRenameCancel() {
    setIsRenaming(false);
    setRenamingName(folder.name);
  }

  // Handle delete click
  function handleDeleteClick(event) {
    event.stopPropagation();
    setShowMenu(false);
    
    if (window.confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      onDeleteFolder(folder.id);
    }
  }

  function handleOpenNote(event) {
    event.stopPropagation();
    if (noteMenuTargetId) {
      onSelectNote(noteMenuTargetId);
    }
    setShowNoteMenu(false);
  }

  function handleGenerateQuestions(event) {
    event.stopPropagation();
    if (noteMenuTargetId) {
      onSelectNote(noteMenuTargetId);
      navigate(`/notes/${noteMenuTargetId}/questions`);
    }
    setShowNoteMenu(false);
  }

  async function handleDeleteNoteClick(event) {
    event.stopPropagation();
    if (!noteMenuTargetId || !onDeleteNote) {
      setShowNoteMenu(false);
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this note? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await onDeleteNote(noteMenuTargetId);
    } catch (err) {
      console.error('Error deleting note:', err);
    } finally {
      setShowNoteMenu(false);
    }
  }

  return (
    <div className="folder-item">
      <div className="folder-header-wrapper">
        <div
          className={`folder-header ${isDropTarget ? 'drop-target' : ''}`}
          onClick={handleFolderClick}
          onContextMenu={handleFolderContextMenu}
          onKeyDown={handleFolderKeyDown}
          onDragOver={handleFolderDragOver}
          onDragLeave={handleFolderDragLeave}
          onDrop={handleFolderDrop}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`${folder.name} folder`}
        >
          <span
            className={`folder-icon ${isExpanded ? 'expanded' : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          {isRenaming ? (
            <input
              type="text"
              className="folder-rename-input"
              value={renamingName}
              onChange={(e) => setRenamingName(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  handleRenameSubmit();
                } else if (e.key === 'Escape') {
                  handleRenameCancel();
                }
              }}
              onBlur={handleRenameSubmit}
              autoFocus
            />
          ) : (
            <span className="folder-name">
              {folder.name}
            </span>
          )}

          {!isUnsorted && showMenu && (
            <div
              ref={menuRef}
              className="folder-context-menu"
              style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }}
            >
              <button
                className="menu-item"
                onClick={handleRenameStart}
              >
                Rename
              </button>
              <button
                className="menu-item delete-item"
                onClick={handleDeleteClick}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <ul className="folder-notes-list">
          {folderNotes.length > 0 ? (
            folderNotes.map((note, index) => (
              <li key={note.id}>
                <button
                  className={`note-item ${
                    selectedNoteId === note.id ? 'selected' : ''
                  }`}
                  draggable
                  onDragStart={(event) => handleNoteDragStart(event, note)}
                  onDragEnd={handleNoteDragEnd}
                  onClick={() => {
                    setShowMenu(false);
                    setShowNoteMenu(false);
                    onSelectNote(note.id);
                  }}
                  onContextMenu={(event) => handleNoteContextMenu(event, note.id)}
                  onKeyDown={(event) => handleNoteKeyDown(event, index)}
                  ref={(el) => {
                    if (focusedNoteIndex === index && el) {
                      el.focus();
                    }
                  }}
                  aria-current={selectedNoteId === note.id ? 'page' : undefined}
                >
                  <span className="note-title">{note.title}</span>
                </button>

                {showNoteMenu && noteMenuTargetId === note.id ? (
                  <div
                    ref={noteMenuRef}
                    className="folder-context-menu"
                    style={{ left: `${noteMenuPosition.x}px`, top: `${noteMenuPosition.y}px` }}
                  >
                    <button className="menu-item" onClick={handleOpenNote}>
                      Open
                    </button>
                    <button className="menu-item" onClick={handleGenerateQuestions}>
                      Generate Questions
                    </button>
                    <button className="menu-item delete-item" onClick={handleDeleteNoteClick}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </li>
            ))
          ) : null}
        </ul>
      )}
    </div>
  );
}

export default FolderItem;
