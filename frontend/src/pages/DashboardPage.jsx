import { Link, useOutletContext } from 'react-router-dom';
import NoteDetailPage from './NoteDetailPage';

const quickActions = [
  { to: '/notes/new', title: 'New Note', copy: 'Capture notes quickly with title and folder.' }
];

function DashboardPage() {
  const { selectedNoteId, onSelectNote, triggerFoldersRefresh, noteDetailRefreshKey } = useOutletContext();

  function handleNoteDeleted() {
    onSelectNote(null);
    triggerFoldersRefresh();
  }

  if (selectedNoteId) {
    return (
      <NoteDetailPage
        noteId={selectedNoteId}
        onDeleted={handleNoteDeleted}
        refreshKey={noteDetailRefreshKey}
      />
    );
  }

  return (
    <section>
      <h2>Dashboard</h2>
      <p className="lead">Welcome to our App!</p>
      <div className="grid-3">
        {quickActions.map((action) => (
          <article key={action.title} className="card">
            <h3>{action.title}</h3>
            <p>{action.copy}</p>
            <Link className="button" to={action.to}>
              Open
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;
