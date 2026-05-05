import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateQuestions, getNoteById } from '../services/api';
import { generateSchedule } from '../services/api';

function QuestionsPage() {
  const { id } = useParams();

  const [note, setNote] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  function gradeAnswer(userAnswer, correctAnswer) {
    if (!userAnswer) return 'missing';

    if (userAnswer.length < correctAnswer.length * 0.5) {
      return 'partial';
    }

    return 'correct';
  }

  useEffect(() => {
    async function loadAndGenerate() {
      try {
        const data = await getNoteById(id);
        const fetchedNote = data.note || null;
        setNote(fetchedNote);

        if (fetchedNote) {
          setGenerating(true);

          const qData = await generateQuestions({
            noteId: id,
            content: fetchedNote.content,
          });

          setQuestions(qData.questions || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    }

    loadAndGenerate();
  }, [id]);

  async function handleGenerate() {
    if (!note) return;

    try {
      setGenerating(true);
      setError('');
      const data = await generateQuestions({
        noteId: id,
        content: note.content,
      });

      setQuestions(data.questions || []);
      setAnswers({});
      setResults([]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit() {
    const resultsArray = questions.map((q, index) => {
      const userAnswer = answers[index]?.trim();

      return {
        question: q.question,
        correctAnswer: q.answer,
        explanation: q.explanation,
        userAnswer: userAnswer || '',
        status: gradeAnswer(userAnswer, q.answer),
      };
    });

    console.log(resultsArray);
    setResults(resultsArray);
    try {
      const data = await generateSchedule(resultsArray);
      localStorage.setItem('reviewSchedule', JSON.stringify(data.schedule));
    } catch (err) {
      console.error('Failed to generate schedule:', err);
    }
  }

  if (loading) {
    return <p>Loading note...</p>;
  }

  return (
    <section>
      <h2>Active Recall Questions</h2>

      {questions.length === 0 && (
        <button
          className="button"
          disabled={generating || !note}
          onClick={handleGenerate}
        >
          {generating ? 'Generating...' : 'Generate Questions'}
        </button>
      )}

      {error && <p className="error-text">{error}</p>}

      {questions.length > 0 && (
        <>
          <ol className="question-list">
            {questions.map((q, index) => (
              <li key={index} className="question-card">
                <p>
                  <strong>Q{index + 1}:</strong> {q.question}
                </p>

                <input
                  type="text"
                  placeholder="Your answer..."
                  value={answers[index] || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [index]: e.target.value,
                    }))
                  }
                />

                {results[index] && (
                  <div>
                    <div
                      style={{
                        padding: '10px',
                        marginTop: '10px',
                        borderRadius: '6px',
                        backgroundColor:
                          results[index].status === 'correct'
                            ? '#d4edda'
                            : results[index].status === 'partial'
                            ? '#fff3cd'
                            : '#f8d7da',
                        color:
                          results[index].status === 'correct'
                            ? '#155724'
                            : results[index].status === 'partial'
                            ? '#856404'
                            : '#721c24',
                      }}
                    >
                      <p>
                        <strong>Your Answer:</strong>{' '}
                        {results[index].userAnswer || 'No answer provided'}
                      </p>

                      <p style={{ marginTop: '4px', fontWeight: 'bold' }}>
                        {results[index].status === 'correct' && 'Correct'}
                        {results[index].status === 'partial' && 'Partially Correct'}
                        {results[index].status === 'missing' && 'Incorrect'}
                      </p>
                    </div>

                    <p>
                      <strong>Correct Answer:</strong>{' '}
                      {results[index].correctAnswer}
                    </p>
                    <p>
                      <strong>Explanation:</strong>{' '}
                      {results[index].explanation}
                    </p>
                  </div>
                )}
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