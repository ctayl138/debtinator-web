/**
 * Client-side only: localStorage adapter for Zustand persist.
 * All data stays in the browser; no backend or server storage.
 */
import type { StateStorage } from 'zustand/middleware';

export const localStorageAdapter: StateStorage = {
  getItem: (name: string) => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(name) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(name, value);
      }
    } catch {
      // ignore
    }
  },
  removeItem: (name: string) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(name);
      }
    } catch {
      // ignore
    }
  },
};
