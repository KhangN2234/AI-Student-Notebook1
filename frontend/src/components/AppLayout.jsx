import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FoldersSidebar from './FoldersSidebar';
import { createFolder } from '../services/api';
import { clearStoredSession } from '../services/auth';

const navItems1 = [
  { to: '/', label: 'Dashboard', end: true, icon: 'home-alt' },
  { to: '/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/progress', label: 'Progress', icon: 'bar-chart-alt-2' },
];

const navItems2 = [
  { to: '/notes/new', label: 'New Notes' },
];

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderRefreshKey, setFolderRefreshKey] = useState(0);
  const [noteDetailRefreshKey, setNoteDetailRefreshKey] = useState(0);

  function triggerFoldersRefresh() {
    setFolderRefreshKey((prev) => prev + 1);
  }

  function triggerSelectedNoteRefresh() {
    setNoteDetailRefreshKey((prev) => prev + 1);
  }

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

  function handlePrimaryNavClick(path) {
    if (path === '/') {
      setSelectedNoteId(null);
    }
  }

  function handleSidebarNoteSelect(noteId) {
    setSelectedNoteId(noteId);

    // Note details currently render in dashboard content area.
    if (location.pathname !== '/') {
      navigate('/');
    }
  }

  function handleLogout() {
    clearStoredSession();
    navigate('/login', { replace: true });
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
                  <box-icon className="note-plus-icon" type='solid' name='file-plus'></box-icon>
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
                  <box-icon className="folder-plus-icon" type='solid' name='folder-plus'></box-icon>
                  New Folder
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
              onSelectNote={handleSidebarNoteSelect}
              refreshKey={folderRefreshKey}
              onSelectedNoteMoved={triggerSelectedNoteRefresh}
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
                  onClick={() => handlePrimaryNavClick(item.to)}
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active' : 'nav-link'
                  }
                >
                  <box-icon className="nav-icon" name={item.icon}></box-icon>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button onClick={handleLogout} type="button">Logout</button>
          </div>
        </aside>
      <main className="content-area">
        <Outlet
          context={{
            selectedNoteId,
            onSelectNote: handleSidebarNoteSelect,
            triggerFoldersRefresh,
            noteDetailRefreshKey,
          }}
        />
      </main>
    </div>
  );
}

export default AppLayout;
