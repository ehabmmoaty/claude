import { useIntl } from 'react-intl';
import { MessageSquare, Search } from 'lucide-react';

export function ConversationsPage() {
  const intl = useIntl();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: 'conversations.title' })}
        </h1>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-3 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'conversations.search' })}
            className="w-full rounded-lg border border-gray-200 bg-muted-light py-2 pe-3 ps-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-muted-dark"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'today', 'week', 'month'].map((filter) => (
            <button
              key={filter}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {intl.formatMessage({ id: `conversations.filter.${filter}` })}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-gray-400">
        <MessageSquare className="h-12 w-12" />
        <p className="text-sm">{intl.formatMessage({ id: 'conversations.empty' })}</p>
      </div>
    </div>
  );
}
