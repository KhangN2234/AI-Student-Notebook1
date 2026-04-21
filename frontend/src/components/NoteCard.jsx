import { Link } from 'react-router-dom';

function NoteCard({ note }) {
  return (
    <article className="card note-card">
      <h3>{note.title}</h3>
      <p className="meta">Folder: {note.folderName || 'Unassigned'}</p>
      <p>{note.preview}</p>
      <Link className="button secondary" to={`/notes/${note.id}`}>
        Open Note
      </Link>
    </article>
  );
}

export default NoteCard;
