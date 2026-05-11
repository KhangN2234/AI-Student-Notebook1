import { useEffect, useState } from 'react';

function CalendarPage() {
  const [schedule, setSchedule] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem('reviewSchedule');
    if (stored) {
      setSchedule(JSON.parse(stored));
    }
  }, []);

  const dates = Object.keys(schedule).sort();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <section>
      <h2>Review Calendar</h2>
      <br />

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom:'10px'}}>
        <button
          onClick={() =>
            setCurrentDate(
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1
              )
            )
          }
        >
          &lt;
        </button>

        <h3 style={{ margin: 0 }}>
          {currentDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>

        <button
          onClick={() =>
            setCurrentDate(
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1
              )
            )
          }
        >
          &gt;
        </button>
      </div>

      {dates.length === 0 ? (
        <p>No reviews scheduled yet.</p>
      ) : (
        (() => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          const days = [];

          for (let i = 0; i < firstDay; i++) {
            days.push(null);
          }

          for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({
              day: d,
              count: schedule[dateKey] || 0,
              dateKey,
            });
          }

          return (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '10px',
              }}
            >
              {days.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (
                      item &&
                      item.count > 0 &&
                      item.dateKey === todayKey
                    ) {
                      alert(`Review ${item.count} questions`);
                    }
                  }}
                  style={{
                    minHeight: '110px',
                    border: '1px solid #ccc',
                    padding: '10px',
                    cursor:
                      item &&
                      item.count > 0 &&
                      item.dateKey === todayKey
                        ? 'pointer'
                        : 'default',
                    backgroundColor:
                      item && item.count > 0
                        ? item.dateKey === todayKey
                          ? '#cce5ff'
                          : '#e6f7ff'
                        : 'white',
                    opacity:
                      item &&
                      item.count > 0 &&
                      item.dateKey !== todayKey
                        ? 0.6
                        : 1,
                  }}
                >
                  {item && (
                    <>
                      <div>
                        <strong>{item.day}</strong>
                      </div>

                      {item.count > 0 && (
                        <div
                          style={{
                            marginTop: '4px',
                            color:
                              item.dateKey === todayKey && item.count > 0
                                ? '#0056b3'
                                : item.dateKey === todayKey
                                ? '#007bff'
                                : 'black',
                            textDecoration:
                              item.dateKey === todayKey
                                ? 'underline'
                                : 'none',
                            fontWeight:
                              item.dateKey === todayKey &&
                              item.count > 0
                                ? '700'
                                : 'normal',
                            cursor:
                              item &&
                              item.count > 0 &&
                              item.dateKey === todayKey
                                ? 'pointer'
                                : 'default',
                          }}
                        >
                          {item.dateKey === todayKey
                            ? `${item.count} questions`
                            : `${item.count} questions (available later)`
                          }
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })()
      )}
    </section>
  );
}

export default CalendarPage;