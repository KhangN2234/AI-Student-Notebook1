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
import { clearReviewSessions, clearSchedule, getReviewSessions } from '../services/api';

function ProgressTooltip(props) {
  const { active, payload, label } = props;

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const correct = payload.find(p => p.dataKey === 'correct')?.value ?? 0;
  const partial = payload.find(p => p.dataKey === 'partial')?.value ?? 0;
  const incorrect = payload.find(p => p.dataKey === 'incorrect')?.value ?? 0;

  return (
    <div className="progress-tooltip">
      <p className="progress-tooltip-date">{label}</p>
      <div className="progress-tooltip-row">
        <span className="progress-tooltip-dot" style={{ backgroundColor: '#16a34a' }} />
        <span className="progress-tooltip-label">Correct</span>
        <strong>{correct}</strong>
      </div>
      <div className="progress-tooltip-row">
        <span className="progress-tooltip-dot" style={{ backgroundColor: '#f59e0b' }} />
        <span className="progress-tooltip-label">Partial</span>
        <strong>{partial}</strong>
      </div>
      <div className="progress-tooltip-row">
        <span className="progress-tooltip-dot" style={{ backgroundColor: '#ef4444' }} />
        <span className="progress-tooltip-label">Incorrect</span>
        <strong>{incorrect}</strong>
      </div>
    </div>
  );
}

function ProgressTrackingPage() {
  const [data, setData] = useState([]);

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all session data? This cannot be undone.'
    );
    if (confirmed) {
      await clearReviewSessions();
      await clearSchedule();
      setData([]);
    }
  };

  useEffect(() => {
    async function loadProgressData() {
      try {
        // TODO: Replace with backend API call when /api/progress is implemented
        // Example:
        // const response = await getProgress();
        // setData(response.data);

        const response = await getReviewSessions();
        const normalized = (response.sessions || []).map((session) => ({
          ...session,
          correct: Number(session.correct) || 0,
          partial: Number(session.partial) || 0,
          incorrect: Number(session.incorrect) || 0,
        }));

        normalized.sort((a, b) => {
          if (a.dateKey === b.dateKey) {
            return (a.sessionNumber || 1) - (b.sessionNumber || 1);
          }

          return a.dateKey.localeCompare(b.dateKey);
        });

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
      const d = new Date(session.dateKey);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year} - ${session.sessionLabel || `Session ${session.sessionNumber || 1}`}`;
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

        <div className="progress-header-actions">
          {sessionCount > 0 && (
            <div className="progress-session-pill">
              {sessionCount} session{sessionCount === 1 ? '' : 's'} logged
            </div>
          )}
          {sessionCount > 0 && (
            <button className="progress-clear-btn" onClick={handleClearAllData}>
              Clear all
            </button>
          )}
        </div>
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
                  <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} content={<ProgressTooltip />} />
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