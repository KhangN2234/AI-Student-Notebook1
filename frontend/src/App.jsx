import { useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [questions, setQuestions] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    if (!notes.trim()) return setError('Please paste some notes first.');
    setError('');
    setLoadingSummary(true);
    try {
      const res = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || 'Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateQuestions = async () => {
    if (!notes.trim()) return setError('Please paste some notes first.');
    setError('');
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message || 'Failed to generate questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div>
      <h1>AI Student Notebook</h1>

      <textarea
        placeholder="Paste your notes here..."
        rows="10"
        cols="50"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <br /><br />

      <button onClick={generateSummary} disabled={loadingSummary}>
        {loadingSummary ? 'Generating...' : 'Generate Summary'}
      </button>
      <button onClick={generateQuestions} disabled={loadingQuestions} style={{ marginLeft: '8px' }}>
        {loadingQuestions ? 'Generating...' : 'Generate Questions'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {summary && (
        <div>
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}

      {questions && (
        <div>
          <h2>Practice Questions</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{questions}</p>
        </div>
      )}
    </div>
  );
}

export default App;
