import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function ProgressTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="progress-tooltip">
      <p className="progress-tooltip-date">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="progress-tooltip-row">
          <span
            className="progress-tooltip-dot"
            style={{ backgroundColor: entry.color }}
          />
          <span className="progress-tooltip-label">{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

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
  const totalAnswers = totals.correct + totals.partial + totals.incorrect;
  const accuracy = totalAnswers > 0 ? Math.round((totals.correct / totalAnswers) * 100) : 0;

  const chartData = data.map((session) => ({
    ...session,
    shortDate: (() => {
      const d = new Date(session.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    })(),
  }));

  const sessionCount = data.length;

  return (
    <section className="progress-page">
      <div className="progress-page-header">
        <div>
          <p className="eyebrow">Progress tracking</p>
          <h2>Review performance</h2>
          <p className="progress-lead">
            Track how each study session is trending over time.
          </p>
        </div>

        {sessionCount > 0 && (
          <div className="progress-session-pill">
            {sessionCount} session{sessionCount === 1 ? '' : 's'} logged
          </div>
        )}
      </div>

      {data.length === 0 && (
        <div className="progress-empty-state card">
          <h2>No review data yet</h2>
          <p>
            Complete a question session to see your progress chart and session summary here.
          </p>
        </div>
      )}

      {data.length > 0 && (
        <div className="progress-stack">
          {/* Totals Row */}
          <div className="progress-totals-grid">
            <div className="card progress-stat-card progress-stat-correct">
              <h2>Correct</h2>
              <p>{totals.correct}</p>
            </div>
            <div className="card progress-stat-card progress-stat-partial">
              <h2>Partial</h2>
              <p>{totals.partial}</p>
            </div>
            <div className="card progress-stat-card progress-stat-incorrect">
              <h2>Incorrect</h2>
              <p>{totals.incorrect}</p>
            </div>
            <div className="card progress-stat-card progress-stat-accuracy">
              <h2>Accuracy</h2>
              <p>{accuracy}%</p>
            </div>
          </div>

          {/* Chart */}
          <div className="card progress-chart-card">
            <div className="progress-chart-header">
              <div>
                <h2>Session history</h2>
                <p className="meta">Correct, partial, and incorrect answers by date.</p>
              </div>
            </div>

            <div className="progress-chart-wrap">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="shortDate" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<ProgressTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="correct"
                    name="Correct"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="partial"
                    name="Partial"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="incorrect"
                    name="Incorrect"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="progress-bottom-grid">
            {/* Insight */}
            {insight && (
              <div className="card progress-insight-card">
                <h2>Insight</h2>
                <p>{insight}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProgressTrackingPage;