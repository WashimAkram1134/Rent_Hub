import { create } from 'zustand';

interface AppState {
  lang: 'EN' | 'BN';
  setLang: (lang: 'EN' | 'BN') => void;
}

export const useAppStore = create<AppState>((set) => ({
  lang: 'EN',
  setLang: (lang) => set({ lang }),
}));
