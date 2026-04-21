import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import NotesInputPage from './pages/NotesInputPage';
import QuestionsPage from './pages/QuestionsPage';
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
    </Routes>
  );
}

export default App;