import { getAuthToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const token = getAuthToken();
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      `Cannot reach backend API (${API_BASE}). Make sure Backend is running with "npm run start".`
    );
  }

  if (!response.ok) {
    let message = '';

    try {
      const errorBody = await response.json();
      message = errorBody?.message || '';
    } catch {
      const errorText = await response.text().catch(() => '');
      message = errorText || '';
    }

    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json();
}

export async function getNotes() {
  return request('/notes');
}

export async function login(payload) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export async function signup(payload) {
  return request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getCurrentUser() {
  return request('/auth/me');
}

export async function getNoteById(id) {
  return request(`/notes/${id}`);
}

export async function createNote(payload) {
  return request('/notes', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateNote(noteId, payload) {
  return request(`/notes/${noteId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function getFolders() {
  return request('/folders');
}

export async function listFolders() {
  return request('/folders');
}

export async function createFolder(payload) {
  return request('/folders', { method: 'POST', body: JSON.stringify(payload) });
}

export async function renameFolder(folderId, newName) {
  return request(`/folders/${folderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: newName }),
  });
}

export async function deleteFolder(folderId) {
  return request(`/folders/${folderId}`, { method: 'DELETE' });
}

export async function assignNoteToFolder(noteId, folderId) {
  return request(`/notes/${noteId}/folder`, {
    method: 'PATCH',
    body: JSON.stringify({ folderId }),
  });
}

export async function moveNoteToFolder(noteId, folderId) {
  return assignNoteToFolder(noteId, folderId);
}

export async function deleteNote(noteId) {
  return request(`/notes/${noteId}`, { method: 'DELETE' });
}

export async function generateSummary(payload) {
  return request('/summaries', { method: 'POST', body: JSON.stringify(payload) });
}

export async function generateQuestions(payload) {
  return request('/questions', { method: 'POST', body: JSON.stringify(payload) });
}

export async function generateSchedule(results, noteId) {
  return request('/schedule', {
    method: 'POST',
    body: JSON.stringify({ results, noteId }),
  });
}

export async function getReviewSessions() {
  return request('/reviews');
}

export async function saveReviewSession(payload) {
  return request('/reviews', { method: 'POST', body: JSON.stringify(payload) });
}

export async function clearReviewSessions() {
  return request('/reviews', { method: 'DELETE' });
}

export async function getSchedule() {
  return request('/schedule');
}

export async function clearSchedule() {
  return request('/schedule', { method: 'DELETE' });
}