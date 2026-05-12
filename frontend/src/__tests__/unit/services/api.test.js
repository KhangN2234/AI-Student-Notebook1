import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiModule from '../../../services/api';
import * as auth from '../../../services/auth';

vi.mock('../../../services/auth');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    auth.getAuthToken.mockReturnValue(null);
    global.fetch = vi.fn();
  });

  const mockApiBase = 'http://localhost:4000/api';

  describe('request function', () => {
    it('makes GET requests without body', async () => {
      const mockResponse = { notes: [] };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiModule.getNotes();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('includes authorization token when available', async () => {
      auth.getAuthToken.mockReturnValue('fake-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ notes: [] }),
      });

      await apiModule.getNotes();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });

    it('throws error when response is not ok with JSON error message', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      });

      await expect(apiModule.login({ identifier: 'user', password: 'pass' })).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('throws error when response is not ok with text error message', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Not JSON')),
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(apiModule.login({ identifier: 'user', password: 'pass' })).rejects.toThrow(
        'Internal Server Error'
      );
    });

    it('throws error when backend is unreachable', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(apiModule.getNotes()).rejects.toThrow('Cannot reach backend API');
    });
  });

  describe('Authentication endpoints', () => {
    it('signup sends POST with user data', async () => {
      const signupData = { username: 'testuser', email: 'test@example.com', password: 'pass123' };
      const mockResponse = { token: 'fake-token', user: { id: '1', ...signupData } };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiModule.signup(signupData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(signupData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('login sends POST with credentials', async () => {
      const loginData = { identifier: 'testuser', password: 'pass123' };
      const mockResponse = { token: 'fake-token', user: { id: '1', username: 'testuser' } };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiModule.login(loginData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(loginData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('getCurrentUser sends GET to /auth/me', async () => {
      const mockUser = { id: '1', username: 'testuser' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await apiModule.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.any(Object)
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('Notes endpoints', () => {
    it('getNotes sends GET request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ notes: [] }),
      });

      await apiModule.getNotes();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes'),
        expect.any(Object)
      );
    });

    it('getNoteById sends GET with note id', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ note: { id: '123', title: 'Test' } }),
      });

      await apiModule.getNoteById('123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/123'),
        expect.any(Object)
      );
    });

    it('createNote sends POST with payload', async () => {
      const noteData = { title: 'New Note', content: 'Content' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ note: noteData }),
      });

      await apiModule.createNote(noteData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(noteData),
        })
      );
    });

    it('updateNote sends PATCH request', async () => {
      const updateData = { title: 'Updated Title' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ note: updateData }),
      });

      await apiModule.updateNote('123', updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/123'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
    });

    it('deleteNote sends DELETE request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await apiModule.deleteNote('123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Folder endpoints', () => {
    it('getFolders sends GET request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ folders: [] }),
      });

      await apiModule.getFolders();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/folders'),
        expect.any(Object)
      );
    });

    it('createFolder sends POST request', async () => {
      const folderData = { name: 'New Folder' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ folder: folderData }),
      });

      await apiModule.createFolder(folderData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/folders'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(folderData),
        })
      );
    });

    it('deleteFolder sends DELETE request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await apiModule.deleteFolder('folder-123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/folders/folder-123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Questions endpoints', () => {
    it('generateQuestions sends POST request', async () => {
      const payload = { noteId: '123', content: 'Note content' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ questions: [] }),
      });

      await apiModule.generateQuestions(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/questions'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });
  });

  describe('Review endpoints', () => {
    it('getReviewSessions sends GET request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ sessions: [] }),
      });

      await apiModule.getReviewSessions();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews'),
        expect.any(Object)
      );
    });

    it('saveReviewSession sends POST request', async () => {
      const sessionData = { noteId: '123', correct: 5, partial: 2, incorrect: 1 };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sessionData),
      });

      await apiModule.saveReviewSession(sessionData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(sessionData),
        })
      );
    });

    it('clearReviewSessions sends DELETE request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await apiModule.clearReviewSessions();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Schedule endpoints', () => {
    it('getSchedule sends GET request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ schedule: [] }),
      });

      await apiModule.getSchedule();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/schedule'),
        expect.any(Object)
      );
    });

    it('generateSchedule sends POST request', async () => {
      const results = [{ status: 'correct' }];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await apiModule.generateSchedule(results, 'note-123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/schedule'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ results, noteId: 'note-123' }),
        })
      );
    });

    it('clearSchedule sends DELETE request', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await apiModule.clearSchedule();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/schedule'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
