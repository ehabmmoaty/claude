import { create } from 'zustand';
import type {
  AppLocale,
  ThemeMode,
  NavigationTab,
  RecordingState,
  AuthUser,
} from '../../shared/types';

interface AppState {
  // Auth
  user: AuthUser | null;
  isAuthLoading: boolean;

  // Navigation
  activeTab: NavigationTab;

  // Locale & Theme
  locale: AppLocale;
  theme: ThemeMode;

  // Recording
  recordingState: RecordingState;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setLocale: (locale: AppLocale) => void;
  setTheme: (theme: ThemeMode) => void;
  setRecordingState: (state: RecordingState) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthLoading: false,

  // Navigation
  activeTab: 'home',

  // Locale & Theme
  locale: 'en',
  theme: 'system',

  // Recording
  recordingState: 'idle',

  // Actions
  setUser: (user) => set({ user }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLocale: (locale) => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    set({ locale });
  },
  setTheme: (theme) => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  setRecordingState: (recordingState) => set({ recordingState }),
}));
