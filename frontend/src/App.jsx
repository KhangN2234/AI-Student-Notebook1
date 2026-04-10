import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import FoldersPage from './pages/FoldersPage';
import NoteDetailPage from './pages/NoteDetailPage';
import NotesInputPage from './pages/NotesInputPage';
import QuestionsPage from './pages/QuestionsPage';
import SummaryPage from './pages/SummaryPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />} path="/">
        <Route element={<DashboardPage />} index />
        <Route element={<NotesInputPage />} path="notes/new" />
        <Route element={<NoteDetailPage />} path="notes/:id" />
        <Route element={<SummaryPage />} path="notes/:id/summary" />
        <Route element={<QuestionsPage />} path="notes/:id/questions" />
        <Route element={<FoldersPage />} path="folders" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}

export default App;