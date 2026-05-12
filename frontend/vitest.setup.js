import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorageMock.clear();
});

// Mock localStorage with in-memory behavior so auth tests can verify persistence.
const localStorageStore = new Map();
const localStorageMock = {
  getItem: vi.fn((key) => (localStorageStore.has(key) ? localStorageStore.get(key) : null)),
  setItem: vi.fn((key, value) => {
    localStorageStore.set(key, String(value));
  }),
  removeItem: vi.fn((key) => {
    localStorageStore.delete(key);
  }),
  clear: vi.fn(() => {
    localStorageStore.clear();
  }),
};

global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock import.meta.env
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:4000/api',
    },
  },
};
