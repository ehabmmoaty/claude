import { useIntl } from 'react-intl';
import { useAppStore } from '../stores/appStore';
import type { NavigationTab } from '../../shared/types';
import {
  Home,
  MessageSquare,
  CheckSquare,
  Bot,
  Search,
  Settings,
  Globe,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'nav.home', icon: Home },
  { id: 'conversations', labelKey: 'nav.conversations', icon: MessageSquare },
  { id: 'tasks', labelKey: 'nav.tasks', icon: CheckSquare },
  { id: 'agents', labelKey: 'nav.agents', icon: Bot },
  { id: 'search', labelKey: 'nav.search', icon: Search },
];

export function Sidebar() {
  const intl = useIntl();
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const user = useAppStore((s) => s.user);

  return (
    <aside className="flex h-full w-sidebar flex-col border-e border-gray-200 bg-surface-light dark:border-gray-700 dark:bg-surface-dark">
      {/* User info */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {user?.displayName?.charAt(0) || 'A'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.displayName}</p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ id, labelKey, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{intl.formatMessage({ id: labelKey })}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="border-t border-gray-200 px-3 py-3 dark:border-gray-700">
        <button
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Toggle language"
        >
          <Globe className="h-5 w-5 shrink-0" />
          <span>{locale === 'en' ? 'العربية' : 'English'}</span>
        </button>
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span>{intl.formatMessage({ id: 'settings.title' })}</span>
        </button>
      </div>
    </aside>
  );
}
