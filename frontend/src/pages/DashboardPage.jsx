import { Link } from 'react-router-dom';

const quickActions = [
  { to: '/notes/new', title: 'New Note', copy: 'Capture notes quickly with title and folder.' },
  { to: '/folders', title: 'Manage Folders', copy: 'Organize notes by class or topic.' },
];

function DashboardPage() {
  return (
    <section>
      <h2>Dashboard</h2>
      <p className="lead">Your command center for notes, summaries, and review questions.</p>
      <div className="grid-3">
        {quickActions.map((action) => (
          <article key={action.title} className="card">
            <h3>{action.title}</h3>
            <p>{action.copy}</p>
            <Link className="button" to={action.to}>
              Open
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;
