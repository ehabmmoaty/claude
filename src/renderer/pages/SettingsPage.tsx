import { useIntl } from 'react-intl';
import {
  Globe,
  Moon,
  Sun,
  Monitor,
  Mic,
  Volume2,
  Info,
  LogOut,
  ChevronRight,
  Keyboard,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { electron, isElectron } from '../lib/electron';
import type { ThemeMode, AppLocale, AudioSource } from '../../shared/types';

export function SettingsPage() {
  const intl = useIntl();
  const locale = useAppStore((s) => s.locale);
  const theme = useAppStore((s) => s.theme);
  const user = useAppStore((s) => s.user);
  const setLocale = useAppStore((s) => s.setLocale);
  const setTheme = useAppStore((s) => s.setTheme);
  const setUser = useAppStore((s) => s.setUser);

  const handleSignOut = async () => {
    if (isElectron) {
      await electron?.logout();
    }
    setUser(null);
  };

  const themeOptions: { value: ThemeMode; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'light', labelKey: 'settings.theme.light', icon: Sun },
    { value: 'dark', labelKey: 'settings.theme.dark', icon: Moon },
    { value: 'system', labelKey: 'settings.theme.system', icon: Monitor },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        {intl.formatMessage({ id: 'settings.title' })}
      </h1>

      {/* Profile Section */}
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {intl.formatMessage({ id: 'settings.profile' })}
        </h2>
        <div className="rounded-xl border border-gray-200 bg-surface-light p-5 dark:border-gray-700 dark:bg-surface-dark">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
              {user?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">{user?.displayName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              {intl.formatMessage({ id: 'auth.signOut' })}
            </button>
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {intl.formatMessage({ id: 'settings.appearance' })}
        </h2>
        <div className="space-y-4">
          {/* Theme */}
          <div className="rounded-xl border border-gray-200 bg-surface-light p-5 dark:border-gray-700 dark:bg-surface-dark">
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'settings.theme' })}
            </p>
            <div className="flex gap-2">
              {themeOptions.map(({ value, labelKey, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                    theme === value
                      ? 'border-brand-500 bg-brand-50 dark:border-brand-600 dark:bg-brand-950/30'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${theme === value ? 'text-brand-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-medium ${theme === value ? 'text-brand-700 dark:text-brand-300' : 'text-gray-500'}`}>
                    {intl.formatMessage({ id: labelKey })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="rounded-xl border border-gray-200 bg-surface-light p-5 dark:border-gray-700 dark:bg-surface-dark">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {intl.formatMessage({ id: 'settings.language' })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {locale === 'en' ? 'English' : 'العربية'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {(['en', 'ar'] as AppLocale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      locale === l
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {l === 'en' ? 'English' : 'العربية'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Section */}
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {intl.formatMessage({ id: 'settings.audio' })}
        </h2>
        <div className="rounded-xl border border-gray-200 bg-surface-light dark:border-gray-700 dark:bg-surface-dark">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <Mic className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'settings.defaultMicrophone' })}
              </p>
              <p className="text-xs text-gray-500">
                {intl.formatMessage({ id: 'settings.systemDefault' })}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <Volume2 className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'settings.systemAudio' })}
              </p>
              <p className="text-xs text-gray-500">
                {isElectron
                  ? intl.formatMessage({ id: 'settings.systemAudioEnabled' })
                  : intl.formatMessage({ id: 'settings.systemAudioUnavailable' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Keyboard className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {intl.formatMessage({ id: 'settings.hotkeys' })}
              </p>
              <p className="text-xs text-gray-500">
                {intl.formatMessage({ id: 'settings.hotkeysDesc' })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mt-8 mb-8">
        <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {intl.formatMessage({ id: 'settings.about' })}
        </h2>
        <div className="rounded-xl border border-gray-200 bg-surface-light px-5 py-4 dark:border-gray-700 dark:bg-surface-dark">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Anees Desktop
              </p>
              <p className="text-xs text-gray-500">
                {intl.formatMessage({ id: 'settings.version' }, { version: '1.0.0' })}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
