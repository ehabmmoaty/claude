import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { RecordingBar } from './components/RecordingBar';
import { LiveTranscript } from './components/LiveTranscript';
import { useRecordingStore } from './stores/recordingStore';
import { LoginScreen } from './pages/LoginScreen';
import { HomePage } from './pages/HomePage';
import { ConversationsPage } from './pages/ConversationsPage';
import { TasksPage } from './pages/TasksPage';
import { AgentsPage } from './pages/AgentsPage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { electron, isElectron } from './lib/electron';
import { MOCK_USER } from './lib/webPreviewData';

const PAGES = {
  home: HomePage,
  conversations: ConversationsPage,
  tasks: TasksPage,
  agents: AgentsPage,
  search: SearchPage,
  settings: SettingsPage,
} as const;

export default function App() {
  const user = useAppStore((s) => s.user);
  const activeTab = useAppStore((s) => s.activeTab);
  const setUser = useAppStore((s) => s.setUser);
  const setRecordingState = useAppStore((s) => s.setRecordingState);
  const setAuthLoading = useAppStore((s) => s.setAuthLoading);
  const locale = useAppStore((s) => s.locale);
  const recState = useRecordingStore((s) => s.recordingState);

  // Check for existing auth session on mount (or auto-login with mock in web preview)
  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      try {
        if (!isElectron) {
          // Web preview: auto-login with mock user
          setUser(MOCK_USER);
        } else {
          const existingUser = await electron?.getUser();
          if (existingUser) setUser(existingUser);
        }
      } catch {
        // No cached session
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [setUser, setAuthLoading]);

  // Listen for recording state changes from main process
  useEffect(() => {
    const cleanup = electron?.onRecordingStateChanged((state) => {
      setRecordingState(state);
    });
    return () => cleanup?.();
  }, [setRecordingState]);

  if (!user) {
    return <LoginScreen />;
  }

  const ActivePage = PAGES[activeTab];
  const isRecordingActive = recState === 'recording' || recState === 'paused';

  return (
    <div className="flex h-screen flex-col overflow-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden bg-muted-light dark:bg-muted-dark">
          <div className="flex-1 overflow-y-auto">
            <ActivePage />
          </div>
          {/* Live transcript panel slides up during recording */}
          {isRecordingActive && (
            <div className="flex h-48 flex-col border-t border-gray-200 bg-surface-light dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 dark:border-gray-800">
                <span className="text-xs font-medium text-gray-500">Live Transcript</span>
              </div>
              <LiveTranscript />
            </div>
          )}
        </main>
      </div>
      <RecordingBar />
    </div>
  );
}
