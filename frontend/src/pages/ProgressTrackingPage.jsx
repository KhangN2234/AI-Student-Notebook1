import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function ProgressTrackingPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadProgressData() {
      try {
        // TODO: Replace with backend API call when /api/progress is implemented
        // Example:
        // const response = await getProgress();
        // setData(response.data);

        let stored = [];
        try {
          stored = JSON.parse(localStorage.getItem('reviewStats')) || [];
        } catch {
          stored = [];
        }

        // normalize + sort by date ascending
        const normalized = stored.map((s) => ({
          date: s.date,
          correct: Number(s.correct) || 0,
          partial: Number(s.partial) || 0,
          incorrect: Number(s.incorrect) || 0,
        }));

        normalized.sort((a, b) => new Date(a.date) - new Date(b.date));

        setData(normalized);
      } catch (err) {
        console.error('Failed to load progress data:', err);
        setData([]);
      }
    }

    loadProgressData();
  }, []);

  function calculateTotals() {
    let correct = 0;
    let partial = 0;
    let incorrect = 0;

    data.forEach((session) => {
      correct += session.correct;
      partial += session.partial;
      incorrect += session.incorrect;
    });

    return { correct, partial, incorrect };
  }

  function getLastSession() {
    if (data.length === 0) return null;
    return data[data.length - 1];
  }

  function getImprovementMessage() {
    if (data.length < 2) return null;

    const last = data[data.length - 1];
    const prev = data[data.length - 2];

    if (last.correct > prev.correct) {
      return 'You improved compared to your last session.';
    }

    if (last.incorrect > prev.incorrect) {
      return 'You may need to review more based on your last session.';
    }

    return 'Your performance is consistent.';
  }

  const totals = calculateTotals();
  const lastSession = getLastSession();
  const insight = getImprovementMessage();

  return (
    <section>
      <h2>Progress Tracking</h2>

      {data.length === 0 && (
        <p style={{ marginTop: '10px' }}>
          No review data yet. Complete a question session to see progress.
        </p>
      )}

      {data.length > 0 && (
        <>
          {/* Totals Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginTop: '16px',
              marginBottom: '20px',
            }}
          >
            <div className="card">
              <h4>Correct</h4>
              <p>{totals.correct}</p>
            </div>
            <div className="card">
              <h4>Partial</h4>
              <p>{totals.partial}</p>
            </div>
            <div className="card">
              <h4>Incorrect</h4>
              <p>{totals.incorrect}</p>
            </div>
          </div>

          {/* Chart */}
          <div
            className="card"
            style={{ width: '100%', height: 320, padding: '16px' }}
          >
            <ResponsiveContainer>
              <LineChart data={data}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const d = new Date(value);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="correct" stroke="green" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="partial" stroke="orange" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="incorrect" stroke="red" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            {/* Legend */}
            <div className="card" style={{ padding: '12px' }}>
              <h4>Legend</h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.9rem',
                  marginTop: '8px',
                }}
              >
                <span>🟢 Correct</span>
                <span>🟠 Partial</span>
                <span>🔴 Incorrect</span>
              </div>
            </div>

            {/* Last Session */}
            {lastSession && (
              <div className="card">
                <h4>Last Session</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.95rem' }}>
                  <p>Date: {lastSession.date}</p>
                  <p>Correct: {lastSession.correct}</p>
                  <p>Partial: {lastSession.partial}</p>
                  <p>Incorrect: {lastSession.incorrect}</p>
                </div>
              </div>
            )}
          </div>

          {/* Insight */}
          {insight && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h4>Insight</h4>
              <p>{insight}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ProgressTrackingPage;