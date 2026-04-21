import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteNote, getNoteById } from '../services/api';


function NoteDetailPage({ noteId, onDeleted }) {
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  

  useEffect(() => {
    async function loadNote() {
      if (!noteId) {
        setNote(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await getNoteById(noteId);
        setNote(data.note || null);
      } catch (err) {
        setError(err.message || 'Unable to load note.');
        setNote(null);
      } finally {
        setLoading(false);
      }
    }

    loadNote();
  }, [noteId]);

  async function handleDelete() {
    if (!note) {
      return;
    }

    const shouldDelete = window.confirm(
      'Are you sure you want to delete this note? This action cannot be undone.'
    );
    if (!shouldDelete) {
      return;
    }

    try {
      setDeleting(true);
      await deleteNote(note.id);
      if (onDeleted) {
        onDeleted(note.id);
      }
    } catch (err) {
      setError(err.message || 'Unable to delete note.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="meta">Loading note...</p>;
  }


  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!note) {
    return <p className="meta">Select a note from the sidebar to view it.</p>;
  }

  return (
    <section className="note-detail-pane stack">
      <header>
        <h2>{note.title}</h2>
        <p className="meta">
          {note.folderName ? `Folder: ${note.folderName}` : 'Folder: Unsorted Notes'}
        </p>
        <p className="meta">Created: {new Date(note.createdAt).toLocaleString()}</p>
        <p className="meta">Updated: {new Date(note.updatedAt).toLocaleString()}</p>
      </header>

      <article className="note-detail-body">
        {note.content}
      </article>

      {note.summary ? (
        <section className="note-detail-body">
          <h3>Summary</h3>
          <p>{note.summary}</p>
        </section>
      ) : null}

      <div className="button-row">
        <Link className="button" to={`/notes/${note.id}/questions`}>
          Generate Questions
        </Link>
        <button className="button secondary" type="button" onClick={() => navigate('/notes/new')}>
          Edit / Reopen
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </section>
  );
}

export default NoteDetailPage;
