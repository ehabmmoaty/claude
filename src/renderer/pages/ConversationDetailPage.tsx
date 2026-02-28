/**
 * ConversationDetailPage — Shows full conversation transcript with
 * metadata sidebar, highlights panel, and search within transcript.
 */

import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  ArrowLeft,
  Clock,
  Users,
  Calendar,
  Search,
  FileText,
  Lightbulb,
  Loader2,
  Download,
  Tag,
} from 'lucide-react';
import { useConversationsStore } from '../stores/conversationsStore';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { HighlightsPanel } from '../components/HighlightsPanel';

type DetailTab = 'transcript' | 'highlights';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ConversationDetailPage() {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<DetailTab>('transcript');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    selectedConversation,
    transcript,
    highlights,
    isDetailLoading,
    selectConversation,
  } = useConversationsStore();

  if (isDetailLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!selectedConversation) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <p className="text-sm">{intl.formatMessage({ id: 'conversations.notFound' })}</p>
      </div>
    );
  }

  const conv = selectedConversation;

  // Compute language stats from transcript
  const langStats = transcript.reduce(
    (acc, seg) => {
      acc[seg.language] = (acc[seg.language] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <button
          onClick={() => selectConversation(null)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-gray-900 dark:text-white">
            {conv.title}
          </h1>
          <p className="text-xs text-gray-500">{formatDate(conv.createdAt)}</p>
        </div>

        {/* Export */}
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
          <Download className="h-3.5 w-3.5" />
          {intl.formatMessage({ id: 'common.export' })}
        </button>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tabs + Search */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'transcript'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                {intl.formatMessage({ id: 'conversations.tab.transcript' })}
                <span className="text-xs text-gray-400">({transcript.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('highlights')}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'highlights'
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Lightbulb className="h-4 w-4" />
                {intl.formatMessage({ id: 'conversations.tab.highlights' })}
                <span className="text-xs text-gray-400">({highlights.length})</span>
              </button>
            </div>

            {/* In-transcript search */}
            {activeTab === 'transcript' && (
              <div className="relative">
                <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={intl.formatMessage({ id: 'conversations.searchTranscript' })}
                  className="w-56 rounded-lg border border-gray-200 bg-muted-light py-1.5 pe-3 ps-8 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-muted-dark dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Tab content */}
          {activeTab === 'transcript' ? (
            <TranscriptViewer segments={transcript} highlightQuery={searchQuery} />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <HighlightsPanel highlights={highlights} />
            </div>
          )}
        </div>

        {/* Metadata sidebar */}
        <div className="w-64 flex-shrink-0 overflow-y-auto border-s border-gray-200 bg-surface-light px-4 py-5 dark:border-gray-700 dark:bg-surface-dark">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {intl.formatMessage({ id: 'conversations.details' })}
          </h3>

          <div className="space-y-4">
            {/* Duration */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {formatDuration(conv.duration)}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(conv.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Speakers */}
            {conv.speakerCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {intl.formatMessage({ id: 'conversations.speakers' }, { count: conv.speakerCount })}
                </span>
              </div>
            )}

            {/* Segments */}
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {intl.formatMessage({ id: 'conversations.segmentCount' }, { count: transcript.length })}
              </span>
            </div>

            {/* Language breakdown */}
            {Object.keys(langStats).length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500">
                  {intl.formatMessage({ id: 'conversations.languages' })}
                </p>
                <div className="flex gap-2">
                  {Object.entries(langStats).map(([lang, count]) => (
                    <span
                      key={lang}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        lang === 'ar'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}
                    >
                      {lang === 'ar' ? 'Arabic' : 'English'} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {conv.tags.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-500">
                  <Tag className="h-3 w-3" />
                  {intl.formatMessage({ id: 'conversations.tags' })}
                </p>
                <div className="flex flex-wrap gap-1">
                  {conv.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">
                {intl.formatMessage({ id: 'conversations.status' })}
              </p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  conv.status === 'complete'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : conv.status === 'recording'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                }`}
              >
                {conv.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
