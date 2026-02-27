import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { RecordingBar } from './components/RecordingBar';
import { LoginScreen } from './pages/LoginScreen';
import { HomePage } from './pages/HomePage';
import { ConversationsPage } from './pages/ConversationsPage';
import { TasksPage } from './pages/TasksPage';
import { AgentsPage } from './pages/AgentsPage';
import { SearchPage } from './pages/SearchPage';
import { electron } from './lib/electron';

const PAGES = {
  home: HomePage,
  conversations: ConversationsPage,
  tasks: TasksPage,
  agents: AgentsPage,
  search: SearchPage,
} as const;

export default function App() {
  const user = useAppStore((s) => s.user);
  const activeTab = useAppStore((s) => s.activeTab);
  const setUser = useAppStore((s) => s.setUser);
  const setRecordingState = useAppStore((s) => s.setRecordingState);
  const setAuthLoading = useAppStore((s) => s.setAuthLoading);
  const locale = useAppStore((s) => s.locale);

  // Check for existing auth session on mount
  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      try {
        const existingUser = await electron?.getUser();
        if (existingUser) setUser(existingUser);
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

  return (
    <div className="flex h-screen flex-col overflow-hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted-light dark:bg-muted-dark">
          <ActivePage />
        </main>
      </div>
      <RecordingBar />
    </div>
  );
}
