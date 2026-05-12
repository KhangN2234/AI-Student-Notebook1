import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as auth from '../../../services/auth';

describe('Auth Service', () => {
  const authKey = 'student-notebook-auth';
  const mockToken = 'fake-jwt-token';
  const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('setStoredSession', () => {
    it('stores session in localStorage', () => {
      const session = { token: mockToken, user: mockUser };
      auth.setStoredSession(session);

      const stored = JSON.parse(localStorage.getItem(authKey));
      expect(stored).toEqual(session);
    });

    it('overwrites existing session', () => {
      auth.setStoredSession({ token: 'old-token', user: mockUser });
      auth.setStoredSession({ token: mockToken, user: mockUser });

      const stored = JSON.parse(localStorage.getItem(authKey));
      expect(stored.token).toBe(mockToken);
    });
  });

  describe('getStoredSession', () => {
    it('returns null when no session stored', () => {
      const session = auth.getStoredSession();
      expect(session).toBeNull();
    });

    it('returns stored session', () => {
      const sessionData = { token: mockToken, user: mockUser };
      localStorage.setItem(authKey, JSON.stringify(sessionData));

      const session = auth.getStoredSession();
      expect(session).toEqual(sessionData);
    });

    it('returns null if token is missing', () => {
      localStorage.setItem(authKey, JSON.stringify({ user: mockUser }));

      const session = auth.getStoredSession();
      expect(session).toBeNull();
    });

    it('returns null if stored data is invalid JSON', () => {
      localStorage.setItem(authKey, 'invalid json');

      const session = auth.getStoredSession();
      expect(session).toBeNull();
    });

    it('handles missing user gracefully', () => {
      localStorage.setItem(authKey, JSON.stringify({ token: mockToken }));

      const session = auth.getStoredSession();
      expect(session).toEqual({ token: mockToken, user: null });
    });
  });

  describe('getAuthToken', () => {
    it('returns null when no token stored', () => {
      const token = auth.getAuthToken();
      expect(token).toBeNull();
    });

    it('returns stored token', () => {
      auth.setStoredSession({ token: mockToken, user: mockUser });

      const token = auth.getAuthToken();
      expect(token).toBe(mockToken);
    });

    it('returns null if session data is invalid', () => {
      localStorage.setItem(authKey, JSON.stringify({ user: mockUser }));

      const token = auth.getAuthToken();
      expect(token).toBeNull();
    });
  });

  describe('clearStoredSession', () => {
    it('removes session from localStorage', () => {
      auth.setStoredSession({ token: mockToken, user: mockUser });
      expect(localStorage.getItem(authKey)).toBeTruthy();

      auth.clearStoredSession();
      expect(localStorage.getItem(authKey)).toBeNull();
    });

    it('works when no session exists', () => {
      expect(() => auth.clearStoredSession()).not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token stored', () => {
      const isAuth = auth.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('returns true when token is stored', () => {
      auth.setStoredSession({ token: mockToken, user: mockUser });

      const isAuth = auth.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('returns false after clearing session', () => {
      auth.setStoredSession({ token: mockToken, user: mockUser });
      auth.clearStoredSession();

      const isAuth = auth.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('returns false if stored data is invalid', () => {
      localStorage.setItem(authKey, 'invalid json');

      const isAuth = auth.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });
});
