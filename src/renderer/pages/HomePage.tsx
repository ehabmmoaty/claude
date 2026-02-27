import { useIntl } from 'react-intl';
import { useAppStore } from '../stores/appStore';
import { Calendar, Mic, MessageSquare, CheckSquare } from 'lucide-react';

export function HomePage() {
  const intl = useIntl();
  const user = useAppStore((s) => s.user);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Welcome */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {intl.formatMessage({ id: 'home.welcome' }, { name: user?.displayName?.split(' ')[0] })}
      </h1>

      {/* Today Board */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {intl.formatMessage({ id: 'home.todayBoard' })}
        </h2>
        <div className="rounded-xl border border-gray-200 bg-surface-light p-6 dark:border-gray-700 dark:bg-surface-dark">
          <div className="flex items-center gap-3 text-gray-400">
            <Calendar className="h-5 w-5" />
            <p className="text-sm">{intl.formatMessage({ id: 'home.noMeetings' })}</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {intl.formatMessage({ id: 'home.quickActions' })}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('conversations')}
            className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-surface-light p-5 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:bg-surface-dark dark:hover:border-brand-700 dark:hover:bg-brand-950"
          >
            <Mic className="h-8 w-8 text-brand-600" />
            <span className="text-sm font-medium">
              {intl.formatMessage({ id: 'recording.start' })}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('conversations')}
            className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-surface-light p-5 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:bg-surface-dark dark:hover:border-brand-700 dark:hover:bg-brand-950"
          >
            <MessageSquare className="h-8 w-8 text-brand-600" />
            <span className="text-sm font-medium">
              {intl.formatMessage({ id: 'nav.conversations' })}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-surface-light p-5 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:bg-surface-dark dark:hover:border-brand-700 dark:hover:bg-brand-950"
          >
            <CheckSquare className="h-8 w-8 text-brand-600" />
            <span className="text-sm font-medium">
              {intl.formatMessage({ id: 'nav.tasks' })}
            </span>
          </button>
        </div>
      </section>

      {/* Recent Conversations */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {intl.formatMessage({ id: 'home.recentConversations' })}
        </h2>
        <div className="rounded-xl border border-gray-200 bg-surface-light p-6 dark:border-gray-700 dark:bg-surface-dark">
          <p className="text-sm text-gray-400">
            {intl.formatMessage({ id: 'conversations.empty' })}
          </p>
        </div>
      </section>
    </div>
  );
}
