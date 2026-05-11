import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { createNote, getFolders, getNoteById, updateNote } from '../services/api';

function NotesInputPage() {
  const { onSelectNote, triggerFoldersRefresh } = useOutletContext();
  const navigate = useNavigate();
  const { id: noteId } = useParams();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ title: '', content: '' });

  const [summary, setSummary] = useState('');
  const [loadingNote, setLoadingNote] = useState(Boolean(noteId));
  const isEditing = Boolean(noteId);

  useEffect(() => {
    async function loadFolders() {
      try {
        const data = await getFolders();
        const folderList = Array.isArray(data) ? data : data.folders || [];
        // Unsorted is represented by null folderId in notes, so keep it as default option.
        setFolders(folderList.filter((folder) => folder.id !== 'unsorted'));
      } catch (err) {
        setStatusMessage(err.message || 'Unable to load folders. Saving to Unsorted is still available.');
      }
    }

    loadFolders();
  }, []);

  useEffect(() => {
    async function loadExistingNote() {
      if (!noteId) {
        setLoadingNote(false);
        return;
      }

      try {
        setLoadingNote(true);
        const data = await getNoteById(noteId);
        const note = data.note || null;

        if (!note) {
          setStatusMessage('Note not found.');
          return;
        }

        setTitle(note.title || '');
        setContent(note.content || '');
        setFolderId(note.folderId || '');
        setSummary(note.summary || '');
        setStatusMessage('');
      } catch (err) {
        setStatusMessage(err.message || 'Unable to load note.');
      } finally {
        setLoadingNote(false);
      }
    }

    loadExistingNote();
  }, [noteId]);

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
    setSummary('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setStatusMessage('');

      const payload = {
        title: title.trim(),
        content: content.trim(),
        folderId: folderId || null,
        summary: summary || null,
      };

      const data = isEditing
        ? await updateNote(noteId, payload)
        : await createNote(payload);

      const createdNoteId = data?.note?.id;

      triggerFoldersRefresh();

      if (createdNoteId) {
        setStatusMessage(isEditing ? 'Note updated successfully. Redirecting...' : 'Note saved successfully. Redirecting...');
        onSelectNote(createdNoteId);
        navigate('/');
      } else {
        setStatusMessage(isEditing ? 'Note updated successfully.' : 'Note saved successfully.');
      }
    } catch (err) {
      setStatusMessage(err.message || (isEditing ? 'Unable to update note.' : 'Unable to save note.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleSummarize() {
    if (!content.trim()) {
      setStatusMessage('Please enter note content before summarizing.');
      return;
    }

    try {
      setStatusMessage('');
      const data = await createNote({
        title: title || 'Temp Note',
        content,
        folderId: folderId || null,
        summarize: true,
      });

      const summaryText = data.summary || 
                          data.note?.summary || 
                          'No summary returned.';

      setSummary(summaryText);
      setStatusMessage('Summary generated successfully.');
    } catch (err) {
      setStatusMessage(err.message || 'Unable to summarize note.');
    }
  }

  return (
    <section className="note-page">
      <header className="note-page-header">
        <h2>{isEditing ? 'Edit Note' : 'Main Note-Taking'}</h2>
        <p className="lead">Capture your notes quickly, organize by class, and save for summaries and active recall.</p>
      </header>

      {loadingNote ? (
        <p className="meta">Loading note...</p>
      ) : null}

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

        <label htmlFor="note-folder">
          Folder
          <select
            id="note-folder"
            value={folderId}
            onChange={(event) => setFolderId(event.target.value)}
          >
            <option value="">Unsorted Notes</option>
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
            placeholder="Nothing here yet..."
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
            {saving ? (isEditing ? 'Updating...' : 'Saving...') : isEditing ? 'Update Note' : 'Save Note'}
          </button>
          <button className="button secondary" disabled={saving} onClick={clearForm} type="button">
            Clear
          </button>
          <button type="button" className="button secondary" onClick={handleSummarize}>
            Summarize
          </button>
        </div>

        {summary && (
          <div className="note-detail-body">
            <h3>Summary</h3>
            <p>{summary}</p>
          </div>
        )}
      </form>
    </section>
  );
}

export default NotesInputPage;
