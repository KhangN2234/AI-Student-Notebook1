import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateQuestions, getNoteById } from '../services/api';

function QuestionsPage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);

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
    if (!note) return;

    try {
      setGenerating(true);
      setError('');
      const data = await generateQuestions({ noteId: id, content: note.content });
      setQuestions(data.questions || []);
      setAnswers({});
      setResults([]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setGenerating(false);
    }
  }

  function handleAnswerChange(index, value) {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  }

  function handleSubmit() {
    const resultsArray = questions.map((_, index) => {
      return answers[index]?.trim() ? '✅ Answered' : '❌ Missing';
    });

    setResults(resultsArray);
  }

  if (loading) {
    return <p>Loading note...</p>;
  }

  return (
    <section>
      <h2>Active Recall Questions</h2>

      <button
        className="button"
        disabled={generating || !note}
        onClick={handleGenerate}
      >
        {generating ? 'Generating...' : 'Generate Questions'}
      </button>

      {error ? <p className="error-text">{error}</p> : null}

      {questions.length > 0 && (
        <>
          <ol className="question-list">
            {questions.map((question, index) => (
              <li key={index}>
                <p>{question}</p>

                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                />

                {results[index] && <p>{results[index]}</p>}
              </li>
            ))}
          </ol>

          <button className="button" onClick={handleSubmit}>
            Submit Answers
          </button>
        </>
      )}
    </section>
  );
}

export default QuestionsPage;