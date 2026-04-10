import { useEffect, useState } from 'react';
import { createFolder, getFolders } from '../services/api';

function FoldersPage() {
  const [folders, setFolders] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getFolders()
      .then((data) => {
        if (!cancelled) {
          setFolders(data.folders || []);
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadFolders() {
    const data = await getFolders();
    setFolders(data.folders || []);
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required.');
      return;
    }

    try {
      setError('');
      await createFolder({ name: name.trim() });
      setName('');
      await loadFolders();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section>
      <h2>Folders</h2>
      <form className="filter-row" onSubmit={handleCreate}>
        <input
          placeholder="Add folder name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className="button" type="submit">
          Create Folder
        </button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}
      <ul className="folder-list">
        {folders.map((folder) => (
          <li key={folder.id}>
            {folder.name} <span className="meta">({folder.noteCount || 0} notes)</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default FoldersPage;
