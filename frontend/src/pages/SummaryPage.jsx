import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateSummary, getNoteById } from '../services/api';

function SummaryPage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getNoteById(id)
      .then((data) => setNote(data.note || null))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerate() {
    if (!note) {
      return;
    }

    try {
      setGenerating(true);
      setError('');
      const data = await generateSummary({ noteId: id, content: note.content });
      setSummary(data.summary || 'No summary returned.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return <p>Loading note...</p>;
  }

  return (
    <section>
      <h2>Summary</h2>
      <p className="lead">Generate a concise review from your note.</p>
      <button className="button" disabled={generating || !note} onClick={handleGenerate}>
        {generating ? 'Generating...' : 'Generate Summary'}
      </button>
      {error ? <p className="error-text">{error}</p> : null}
      {summary ? <article className="card output">{summary}</article> : null}
    </section>
  );
}

export default SummaryPage;
