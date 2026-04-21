import { useEffect, useRef, useState } from 'react';
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
}) {
  const [focusedNoteIndex, setFocusedNoteIndex] = useState(-1);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingName, setRenamingName] = useState(folder.name);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) {
      return;
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    }

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu]);

  // Filter notes for this folder
  const folderNotes = notes.filter((note) => note.folderId === folder.id);
  const isUnsorted = folder.isUnsorted === true;

  // Handle folder click to expand/collapse
  function handleFolderClick() {
    setShowMenu(false);
    onToggle(folder.id);
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
    setShowMenu(true);
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

  return (
    <div className="folder-item">
      <div className="folder-header-wrapper">
        <div
          className="folder-header"
          onClick={handleFolderClick}
          onContextMenu={handleFolderContextMenu}
          onKeyDown={handleFolderKeyDown}
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
                  onClick={() => onSelectNote(note.id)}
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
              </li>
            ))
          ) : null}
        </ul>
      )}
    </div>
  );
}

export default FolderItem;
