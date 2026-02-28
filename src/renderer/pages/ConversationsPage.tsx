import { useEffect, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { MessageSquare, Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { useConversationsStore } from '../stores/conversationsStore';
import { ConversationCard } from '../components/ConversationCard';
import { ConversationDetailPage } from './ConversationDetailPage';
import type { DateFilter, SortField } from '../services/conversationService';

const DATE_FILTERS: DateFilter[] = ['all', 'today', 'week', 'month'];

export function ConversationsPage() {
  const intl = useIntl();
  const searchTimerRef = useRef<number | null>(null);

  const {
    conversations,
    totalCount,
    isLoading,
    dateFilter,
    searchQuery,
    sortField,
    sortOrder,
    page,
    pageSize,
    selectedConversationId,
    loadConversations,
    setDateFilter,
    setSearchQuery,
    setSortField,
    setSortOrder,
    setPage,
    selectConversation,
    renameConversation,
    removeConversation,
  } = useConversationsStore();

  // Load on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = window.setTimeout(() => {
        setSearchQuery(value);
      }, 300);
    },
    [setSearchQuery]
  );

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
      } else {
        setSortField(field);
      }
    },
    [sortField, sortOrder, setSortField, setSortOrder]
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  // If a conversation is selected, show the detail view
  if (selectedConversationId) {
    return <ConversationDetailPage />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {intl.formatMessage({ id: 'conversations.title' })}
          </h1>
          {totalCount > 0 && (
            <p className="mt-0.5 text-xs text-gray-500">
              {intl.formatMessage({ id: 'conversations.count' }, { count: totalCount })}
            </p>
          )}
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => toggleSort('created_at')}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {intl.formatMessage({
            id: sortOrder === 'desc' ? 'conversations.sort.newest' : 'conversations.sort.oldest',
          })}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-3 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            defaultValue={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={intl.formatMessage({ id: 'conversations.search' })}
            className="w-full rounded-lg border border-gray-200 bg-muted-light py-2 pe-3 ps-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-muted-dark dark:text-white"
          />
        </div>
        <div className="flex gap-1">
          {DATE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                dateFilter === filter
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {intl.formatMessage({ id: `conversations.filter.${filter}` })}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-gray-400">
            <MessageSquare className="h-12 w-12" />
            <p className="text-sm">
              {searchQuery
                ? intl.formatMessage({ id: 'search.noResults' })
                : intl.formatMessage({ id: 'conversations.empty' })}
            </p>
          </div>
        ) : (
          <div className="space-y-2 px-6 py-4">
            {conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversationId === conv.id}
                onSelect={(id) => selectConversation(id)}
                onRename={renameConversation}
                onDelete={removeConversation}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 dark:border-gray-700">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {intl.formatMessage({ id: 'conversations.prev' })}
          </button>
          <span className="text-xs text-gray-500">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {intl.formatMessage({ id: 'conversations.next' })}
          </button>
        </div>
      )}
    </div>
  );
}
