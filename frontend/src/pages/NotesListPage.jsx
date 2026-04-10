import { useEffect, useMemo, useState } from 'react';
import NoteCard from '../components/NoteCard';
import { getFolders, getNotes } from '../services/api';

function NotesListPage() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [query, setQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getNotes(), getFolders()])
      .then(([notesData, foldersData]) => {
        setNotes(notesData.notes || []);
        setFolders(foldersData.folders || []);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const text = `${note.title} ${note.content}`.toLowerCase();
      const queryMatch = text.includes(query.toLowerCase());
      const folderMatch = folderFilter ? note.folderId === folderFilter : true;
      return queryMatch && folderMatch;
    });
  }, [notes, query, folderFilter]);

  if (loading) {
    return <p>Loading notes...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <section>
      <h2>Saved Notes</h2>
      <div className="filter-row">
        <input
          placeholder="Search by title or content"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={folderFilter} onChange={(event) => setFolderFilter(event.target.value)}>
          <option value="">All folders</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      {filteredNotes.length === 0 ? (
        <p>No matching notes found.</p>
      ) : (
        <div className="grid-2">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={{
                id: note.id,
                title: note.title,
                folderName: note.folderName,
                preview: note.content.slice(0, 140),
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default NotesListPage;
