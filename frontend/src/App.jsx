import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import NotesInputPage from './pages/NotesInputPage';
import QuestionsPage from './pages/QuestionsPage';
import SignupPage from './pages/SignupPage';
import { isAuthenticated } from './services/auth';
import CalendarPage from './pages/CalendarPage';
import ProgressTrackingPage from './pages/ProgressTrackingPage';
import './App.css';

function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignupPage />} path="/signup" />

      <Route
        element={(
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        )}
        path="/"
      >
        <Route element={<DashboardPage />} index />
        <Route element={<NotesInputPage />} path="notes/new" />
        <Route element={<QuestionsPage />} path="notes/:id/questions" />
        <Route element={<CalendarPage />} path="calendar" />
        <Route element={<ProgressTrackingPage />} path="progress" />
      </Route>
      <Route
        element={<Navigate replace to={isAuthenticated() ? '/' : '/login'} />}
        path="*"
      />
    </Routes>
  );
}

export default App;