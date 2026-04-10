import { NavLink, Outlet } from 'react-router-dom';

const navItems1 = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/folders', label: 'Folders' },
];

const navItems2 = [
  { to: '/notes/new', label: 'New Notes' },
];

function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
          {/* Top / Logo */}
          <div className="sidebar-top">
            <p className="eyebrow">AI Student Notebook</p>
            <h1>Study Better</h1>
          </div>

          {/* Middle / Scrollable (folders later) */}
          <div className="sidebar-middle">
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
            {/* Future folder tree goes here */}
            {/* <FolderTree /> */}
            
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
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
