import { useIntl } from 'react-intl';
import { Search } from 'lucide-react';

export function SearchPage() {
  const intl = useIntl();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: 'search.title' })}
        </h1>
      </div>

      {/* Search Input */}
      <div className="px-6 py-6">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'search.placeholder' })}
            className="w-full rounded-xl border border-gray-200 bg-surface-light py-3.5 pe-4 ps-12 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-surface-dark"
            autoFocus
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-gray-400">
        <Search className="h-12 w-12" />
        <p className="text-sm">{intl.formatMessage({ id: 'search.noResults' })}</p>
      </div>
    </div>
  );
}
