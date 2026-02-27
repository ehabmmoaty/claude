import { useIntl } from 'react-intl';
import { useAppStore } from '../stores/appStore';
import { electron } from '../lib/electron';
import { Bot } from 'lucide-react';

export function LoginScreen() {
  const intl = useIntl();
  const setUser = useAppStore((s) => s.setUser);
  const isAuthLoading = useAppStore((s) => s.isAuthLoading);
  const setAuthLoading = useAppStore((s) => s.setAuthLoading);

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const user = await electron?.login();
      if (user) setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white dark:from-brand-950 dark:to-surface-dark">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
          <Bot className="h-10 w-10 text-white" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Anees Desktop</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            AI Companion for Abu Dhabi Government
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isAuthLoading}
          className="mt-4 flex items-center gap-3 rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-brand-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAuthLoading ? (
            <span>{intl.formatMessage({ id: 'auth.signingIn' })}</span>
          ) : (
            <span>{intl.formatMessage({ id: 'auth.signIn' })}</span>
          )}
        </button>

        {/* Version */}
        <p className="mt-8 text-xs text-gray-400">v0.1.0 — AI Factory, DGE Abu Dhabi</p>
      </div>
    </div>
  );
}
