import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useAppStore } from '../stores/appStore';
import { useConversationsStore } from '../stores/conversationsStore';
import { fetchRecentConversations } from '../services/conversationService';
import { Calendar, Mic, MessageSquare, CheckSquare, Clock, ChevronRight } from 'lucide-react';
import type { Conversation } from '../../shared/types';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function HomePage() {
  const intl = useIntl();
  const user = useAppStore((s) => s.user);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const selectConversation = useConversationsStore((s) => s.selectConversation);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchRecentConversations(5).then(setRecentConversations).catch(console.error);
  }, []);

  const handleOpenConversation = (id: string) => {
    selectConversation(id);
    setActiveTab('conversations');
  };

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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {intl.formatMessage({ id: 'home.recentConversations' })}
          </h2>
          {recentConversations.length > 0 && (
            <button
              onClick={() => setActiveTab('conversations')}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              {intl.formatMessage({ id: 'conversations.viewAll' })}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {recentConversations.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-surface-light p-6 dark:border-gray-700 dark:bg-surface-dark">
            <p className="text-sm text-gray-400">
              {intl.formatMessage({ id: 'conversations.empty' })}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleOpenConversation(conv.id)}
                className="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-surface-light p-4 text-start transition-colors hover:border-brand-300 hover:shadow-sm dark:border-gray-700 dark:bg-surface-dark dark:hover:border-brand-700"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                  <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {conv.title}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(conv.duration)}
                    </span>
                    <span>{formatRelativeDate(conv.createdAt)}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
