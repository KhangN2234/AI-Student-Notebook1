import { useEffect, useState } from 'react';

function CalendarPage() {
    const [schedule, setSchedule] = useState({});

    useEffect(() => {
        const stored = localStorage.getItem('reviewSchedule');
        if (stored) {
            setSchedule(JSON.parse(stored));
        }
    }, []);

    const dates = Object.keys(schedule).sort()

    return (
        <section>
            <h2>Review Calendar</h2>

            {dates.length === 0 ? (
                <p>No reviews scheduled yet.</p>
            ) : (
                <ul>
                    {dates.map((date) => (
                        <li key={date}>
                            <strong>{date}</strong>: {schedule[date]}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default CalendarPage;