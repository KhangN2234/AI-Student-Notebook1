import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getNoteById } from '../services/api';

function NoteDetailPage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getNoteById(id)
      .then((data) => setNote(data.note || null))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p>Loading note...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!note) {
    return <p>Note not found.</p>;
  }

  return (
    <section>
      <h2>{note.title}</h2>
      <p className="meta">Folder: {note.folderName || 'Unassigned'}</p>
      <pre className="note-detail">{note.content}</pre>
      <div className="button-row">
        <Link className="button" to={`/notes/${id}/summary`}>
          Generate Summary
        </Link>
        <Link className="button secondary" to={`/notes/${id}/questions`}>
          Generate Questions
        </Link>
      </div>
    </section>
  );
}

export default NoteDetailPage;
