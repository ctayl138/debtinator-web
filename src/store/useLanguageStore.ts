import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { localStorageAdapter } from './storage';

export type Language = 'en' | 'es';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'debtinator-language-storage',
      storage: createJSONStorage(() => localStorageAdapter),
    }
  )
);
