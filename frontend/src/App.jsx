import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import NotesInputPage from './pages/NotesInputPage';
import QuestionsPage from './pages/QuestionsPage';
import CalendarPage from './pages/CalendarPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />} path="/">
        <Route element={<DashboardPage />} index />
        <Route element={<NotesInputPage />} path="notes/new" />
        <Route element={<QuestionsPage />} path="notes/:id/questions" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
      <Route element={<CalendarPage />} path="calendar" />
    </Routes>
  );
}

export default App;