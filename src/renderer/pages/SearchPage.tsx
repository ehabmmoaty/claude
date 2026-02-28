import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
  Search,
  MessageSquare,
  CheckSquare,
  Bot,
  Clock,
  Loader2,
  FileText,
  Lightbulb,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useConversationsStore } from '../stores/conversationsStore';
import { isElectron } from '../lib/electron';
import {
  MOCK_CONVERSATIONS,
  MOCK_TASKS,
  MOCK_COMPANIONS,
  MOCK_SEGMENTS,
  MOCK_HIGHLIGHTS,
} from '../lib/webPreviewData';

type SearchResultType = 'conversation' | 'task' | 'agent' | 'transcript' | 'highlight';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  meta?: string;
  parentId?: string;
}

const TYPE_ICONS: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
  conversation: MessageSquare,
  task: CheckSquare,
  agent: Bot,
  transcript: FileText,
  highlight: Lightbulb,
};

const TYPE_COLORS: Record<SearchResultType, string> = {
  conversation: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  task: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  agent: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  transcript: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  highlight: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
};

function searchMockData(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Search conversations
  MOCK_CONVERSATIONS.forEach((c) => {
    if (c.title.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))) {
      results.push({
        id: c.id,
        type: 'conversation',
        title: c.title,
        subtitle: `${Math.floor(c.duration / 60)}m · ${c.speakerCount} speakers`,
        meta: new Date(c.createdAt).toLocaleDateString(),
      });
    }
  });

  // Search tasks
  MOCK_TASKS.forEach((t) => {
    if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
      results.push({
        id: t.id,
        type: 'task',
        title: t.title,
        subtitle: t.description || '',
        meta: t.priority,
      });
    }
  });

  // Search companions
  MOCK_COMPANIONS.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.nameAr.includes(query)) {
      results.push({
        id: c.id,
        type: 'agent',
        title: c.name,
        subtitle: c.description,
      });
    }
  });

  // Search transcript segments
  MOCK_SEGMENTS.forEach((s) => {
    if (s.text.toLowerCase().includes(q)) {
      const conv = MOCK_CONVERSATIONS.find((c) => c.id === s.conversationId);
      results.push({
        id: s.id,
        type: 'transcript',
        title: s.text.length > 80 ? s.text.slice(0, 80) + '...' : s.text,
        subtitle: `${s.speakerLabel} · ${conv?.title || 'Unknown'}`,
        parentId: s.conversationId,
      });
    }
  });

  // Search highlights
  MOCK_HIGHLIGHTS.forEach((h) => {
    if (h.text.toLowerCase().includes(q)) {
      results.push({
        id: h.id,
        type: 'highlight',
        title: h.text.length > 80 ? h.text.slice(0, 80) + '...' : h.text,
        subtitle: h.type.replace('_', ' '),
        parentId: h.conversationId,
      });
    }
  });

  return results;
}

export function SearchPage() {
  const intl = useIntl();
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const selectConversation = useConversationsStore((s) => s.selectConversation);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>('all');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const t = setTimeout(() => {
      setIsSearching(true);
      // For web preview, search mock data. In Electron, would use FTS5.
      const r = searchMockData(query);
      setResults(r);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(t);
  }, [query]);

  const filters: { value: SearchResultType | 'all'; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { value: 'all', label: intl.formatMessage({ id: 'conversations.filter.all' }) },
    { value: 'conversation', label: intl.formatMessage({ id: 'nav.conversations' }), icon: MessageSquare },
    { value: 'task', label: intl.formatMessage({ id: 'nav.tasks' }), icon: CheckSquare },
    { value: 'agent', label: intl.formatMessage({ id: 'nav.agents' }), icon: Bot },
    { value: 'transcript', label: intl.formatMessage({ id: 'search.transcripts' }), icon: FileText },
  ];

  const filtered = activeFilter === 'all' ? results : results.filter((r) => r.type === activeFilter);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'conversation':
        selectConversation(result.id);
        setActiveTab('conversations');
        break;
      case 'task':
        setActiveTab('tasks');
        break;
      case 'agent':
        setActiveTab('agents');
        break;
      case 'transcript':
      case 'highlight':
        if (result.parentId) {
          selectConversation(result.parentId);
          setActiveTab('conversations');
        }
        break;
    }
  };

  // Group results by type
  const grouped = filtered.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    },
    {} as Record<SearchResultType, SearchResult[]>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: 'search.title' })}
        </h1>
      </div>

      {/* Search Input */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={intl.formatMessage({ id: 'search.placeholder' })}
            className="w-full rounded-xl border border-gray-200 bg-surface-light py-3.5 pe-12 ps-12 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-surface-dark dark:text-white"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        {query && results.length > 0 && (
          <div className="mt-3 flex gap-2">
            {filters.map(({ value, label, icon: FilterIcon }) => {
              const count = value === 'all' ? results.length : results.filter((r) => r.type === value).length;
              if (value !== 'all' && count === 0) return null;
              return (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeFilter === value
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {FilterIcon && <FilterIcon className="h-3 w-3" />}
                  {label}
                  <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : !query ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="mb-3 h-12 w-12" />
            <p className="text-sm">{intl.formatMessage({ id: 'search.hint' })}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="mb-3 h-12 w-12" />
            <p className="text-sm">{intl.formatMessage({ id: 'search.noResults' })}</p>
          </div>
        ) : activeFilter === 'all' ? (
          // Grouped view
          <div className="space-y-6">
            {(Object.entries(grouped) as [SearchResultType, SearchResult[]][]).map(([type, items]) => (
              <div key={type}>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {(() => {
                    const Icon = TYPE_ICONS[type];
                    return <Icon className="h-3.5 w-3.5" />;
                  })()}
                  {type === 'conversation'
                    ? intl.formatMessage({ id: 'nav.conversations' })
                    : type === 'task'
                      ? intl.formatMessage({ id: 'nav.tasks' })
                      : type === 'agent'
                        ? intl.formatMessage({ id: 'nav.agents' })
                        : type === 'transcript'
                          ? intl.formatMessage({ id: 'search.transcripts' })
                          : intl.formatMessage({ id: 'conversations.tab.highlights' })}
                  <span className="text-gray-400">({items.length})</span>
                </h3>
                <div className="space-y-1">
                  {items.slice(0, 5).map((r) => (
                    <ResultItem key={r.id} result={r} onClick={() => handleResultClick(r)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat list
          <div className="space-y-1">
            {filtered.map((r) => (
              <ResultItem key={r.id} result={r} onClick={() => handleResultClick(r)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultItem({ result, onClick }: { result: SearchResult; onClick: () => void }) {
  const Icon = TYPE_ICONS[result.type];
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TYPE_COLORS[result.type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{result.title}</p>
        <p className="truncate text-xs text-gray-500">{result.subtitle}</p>
      </div>
      {result.meta && (
        <span className="shrink-0 text-xs text-gray-400">{result.meta}</span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
    </button>
  );
}
