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
    <section className="calendar-section">
      <div className="calendar-header">
        <h2>Review Calendar</h2>
      </div>

        {/* Month Navigation */}
        <div className="calendar-month-nav">
          <button
            className="calendar-btn"
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1
                )
              )
            }
          >
          <box-icon className="arrow-icon" name='chevron-left'></box-icon>
          </button>

          <button
            className="calendar-btn"
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1
                )
              )
            }
          >

          <box-icon className="arrow-icon" name='chevron-right' ></box-icon>
          </button>
        
          <h3 className="calendar-month-title">
              {currentDate.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
          </h3>
  
        </div>

        {/* Weekday headers */}
        <div className="calendar-weekdays" role="presentation">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
      </div>

      {dates.length === 0 ? (
        <p className="calendar-empty">No reviews scheduled yet.</p>
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
            <div className="calendar-grid">
              {days.map((item, index) => {
                const isToday = item && item.dateKey === todayKey;
                const hasCount = item && item.count > 0;
                const cellClass = `calendar-cell ${!item ? 'empty' : ''} ${hasCount ? 'has-count' : ''} ${isToday ? 'today' : ''}`;

                return (
                  <div
                    key={index}
                    className={cellClass}
                    onClick={() => {
                      if (item && item.count > 0 && item.dateKey === todayKey) {
                        alert(`Review ${item.count} questions`);
                      }
                    }}
                  >
                    {item && (
                      <>
                        <div className="calendar-day-number">
                          <strong>{item.day}</strong>
                        </div>

                        {item.count > 0 && (
                          <div className={`calendar-count ${isToday ? 'today' : ''}`}>
                            {isToday
                              ? `${item.count} questions`
                              : `${item.count} questions (available later)`
                            }
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()
      )}
    </section>
  );
}

export default CalendarPage;