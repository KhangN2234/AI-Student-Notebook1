import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/notes/new', label: 'New Note' },
  { to: '/notes', label: 'Notes' },
  { to: '/folders', label: 'Folders' },
];

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AI Student Notebook</p>
          <h1>Study Smarter</h1>
        </div>
        <nav aria-label="Primary" className="topnav">
          {navItems.map((item) => (
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
      </header>
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
