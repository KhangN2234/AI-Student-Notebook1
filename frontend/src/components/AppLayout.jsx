import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import FoldersSidebar from './FoldersSidebar';
import { createFolder } from '../services/api';

const navItems1 = [
  { to: '/', label: 'Dashboard', end: true },
];

const navItems2 = [
  { to: '/notes/new', label: 'New Notes' },
];

function AppLayout() {
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderRefreshKey, setFolderRefreshKey] = useState(0);

  async function handleCreateFolder() {
    const safeName = newFolderName.trim();
    if (!safeName) {
      return;
    }

    try {
      setIsCreatingFolder(true);
      await createFolder({ name: safeName });
      setNewFolderName('');
      setShowNewFolderInput(false);
      setFolderRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error creating folder:', err);
    } finally {
      setIsCreatingFolder(false);
    }
  }

  function handleCancelCreateFolder() {
    setShowNewFolderInput(false);
    setNewFolderName('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
          {/* Top / Logo */}
          <div className="sidebar-top">
            <p className="eyebrow">AI Student Notebook</p>
            <h1>Study Better</h1>
                        <div className="sidebar-create-group">
              {navItems2.map((item) => (
                <NavLink
                  key={item.to}
                  end={item.end}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active' : 'nav-link'
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {!showNewFolderInput ? (
                <button
                  className="nav-link sidebar-new-folder-btn"
                  type="button"
                  onClick={() => setShowNewFolderInput(true)}
                  disabled={isCreatingFolder}
                >
                  + New Folder
                </button>
              ) : (
                <div className="sidebar-new-folder-input-group">
                  <input
                    className="sidebar-new-folder-input"
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(event) => setNewFolderName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleCreateFolder();
                      } else if (event.key === 'Escape') {
                        handleCancelCreateFolder();
                      }
                    }}
                    autoFocus
                    disabled={isCreatingFolder}
                  />
                  <button
                    className="sidebar-new-folder-action"
                    type="button"
                    onClick={handleCreateFolder}
                    disabled={isCreatingFolder || !newFolderName.trim()}
                  >
                    {isCreatingFolder ? '...' : '✓'}
                  </button>
                  <button
                    className="sidebar-new-folder-action"
                    type="button"
                    onClick={handleCancelCreateFolder}
                    disabled={isCreatingFolder}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Middle / Scrollable (folders) */}
          <div className="sidebar-middle">

            {/* Folder Tree */}
            <FoldersSidebar 
              selectedNoteId={selectedNoteId} 
              onSelectNote={setSelectedNoteId}
              refreshKey={folderRefreshKey}
            />
          </div>

          {/* Bottom / Actions */}
          <div className="sidebar-bottom">
            <nav aria-label="Primary" className="sidenav">
              {navItems1.map((item) => (
                <NavLink
                  key={item.to}
                  end={item.end}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active' : 'nav-link'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button>Logout</button>
          </div>
        </aside>
      <main className="content-area">
        <Outlet context={{ selectedNoteId, onSelectNote: setSelectedNoteId }} />
      </main>
    </div>
  );
}

export default AppLayout;
