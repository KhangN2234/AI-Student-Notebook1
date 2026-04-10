import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNote, getFolders } from '../services/api';

function NotesInputPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ title: '', content: '' });

  function validateForm() {
    const nextErrors = { title: '', content: '' };
    if (!title.trim()) {
      nextErrors.title = 'Please enter a title for this note.';
    }
    if (!content.trim()) {
      nextErrors.content = 'Please enter your note content.';
    }

    setFieldErrors(nextErrors);
    return !nextErrors.title && !nextErrors.content;
  }

  function clearForm() {
    setTitle('');
    setContent('');
    setFolderId('');
    setStatusMessage('');
    setFieldErrors({ title: '', content: '' });
  }

  useEffect(() => {
    getFolders()
      .then((data) => setFolders(data.folders || []))
      .catch(() => {
        setFolders([]);
        setStatusMessage('Folders could not be loaded. You can still save notes as unassigned.');
      });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setStatusMessage('');
      await createNote({ title: title.trim(), content: content.trim(), folderId: folderId || null });
      setStatusMessage('Note saved successfully. Redirecting to your notes...');
      setTimeout(() => navigate('/notes'), 800);
    } catch (requestError) {
      setStatusMessage(requestError.message || 'Unable to save note right now. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="note-page">
      <header className="note-page-header">
        <h2>Main Note-Taking</h2>
        <p className="lead">Capture your notes quickly, organize by class, and save for summaries and active recall.</p>
      </header>

      <form className="stack note-form-card" onSubmit={handleSubmit}>
        <label htmlFor="note-title">
          Note Title
          <input
            id="note-title"
            aria-invalid={fieldErrors.title ? 'true' : 'false'}
            aria-describedby={fieldErrors.title ? 'title-error' : undefined}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (fieldErrors.title) {
                setFieldErrors((prev) => ({ ...prev, title: '' }));
              }
            }}
            placeholder="Example: Biology Chapter 4"
          />
        </label>
        {fieldErrors.title ? (
          <p className="error-text field-error" id="title-error">
            {fieldErrors.title}
          </p>
        ) : null}

        <label htmlFor="folder-select">
          Folder
          <select id="folder-select" value={folderId} onChange={(event) => setFolderId(event.target.value)}>
            <option value="">Unassigned</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </label>

        <label className="upload-placeholder" htmlFor="upload-placeholder-input">
          Upload notes file (coming soon)
          <input
            id="upload-placeholder-input"
            type="file"
            accept=".txt,.md,.pdf,.docx"
            disabled
            aria-describedby="upload-help"
          />
        </label>
        <p className="meta" id="upload-help">
          File parsing is not implemented yet. Please paste your notes manually below for now.
        </p>

        <label htmlFor="note-content">
          Notes
          <textarea
            id="note-content"
            aria-invalid={fieldErrors.content ? 'true' : 'false'}
            aria-describedby={fieldErrors.content ? 'content-error' : undefined}
            rows={12}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              if (fieldErrors.content) {
                setFieldErrors((prev) => ({ ...prev, content: '' }));
              }
            }}
            placeholder="Paste lecture notes here..."
          />
        </label>
        {fieldErrors.content ? (
          <p className="error-text field-error" id="content-error">
            {fieldErrors.content}
          </p>
        ) : null}

        {statusMessage ? <p className="status-text">{statusMessage}</p> : null}

        <div className="button-row">
          <button className="button" disabled={saving} type="submit">
            {saving ? 'Saving...' : 'Save Note'}
          </button>
          <button className="button secondary" disabled={saving} onClick={clearForm} type="button">
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}

export default NotesInputPage;
