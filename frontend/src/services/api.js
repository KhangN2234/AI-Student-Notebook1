const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error(
      `Cannot reach backend API (${API_BASE}). Make sure Backend is running with "npm run start".`
    );
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Request failed');
  }

  return response.json();
}

export async function getNotes() {
  return request('/notes');
}

export async function getNoteById(id) {
  return request(`/notes/${id}`);
}

export async function createNote(payload) {
  return request('/notes', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getFolders() {
  return request('/folders');
}

export async function createFolder(payload) {
  return request('/folders', { method: 'POST', body: JSON.stringify(payload) });
}

export async function assignNoteToFolder(noteId, folderId) {
  return request(`/notes/${noteId}/folder`, {
    method: 'PATCH',
    body: JSON.stringify({ folderId }),
  });
}

export async function generateSummary(payload) {
  return request('/summaries', { method: 'POST', body: JSON.stringify(payload) });
}

export async function generateQuestions(payload) {
  return request('/questions', { method: 'POST', body: JSON.stringify(payload) });
}
