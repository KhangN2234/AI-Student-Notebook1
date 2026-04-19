import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import FoldersSidebar from './FoldersSidebar';

const navItems1 = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/folders', label: 'Folders' },
];

const navItems2 = [
  { to: '/notes/new', label: 'New Notes' },
];

function AppLayout() {
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  return (
    <div className="app-shell">
      <aside className="sidebar">
          {/* Top / Logo */}
          <div className="sidebar-top">
            <p className="eyebrow">AI Student Notebook</p>
            <h1>Study Better</h1>
          </div>

          {/* Middle / Scrollable (folders) */}
          <div className="sidebar-middle">
            {/* New Notes Link */}
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

            {/* Folder Tree */}
            <FoldersSidebar 
              selectedNoteId={selectedNoteId} 
              onSelectNote={setSelectedNoteId}
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
