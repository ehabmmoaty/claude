import { useIntl } from 'react-intl';
import { Clock, MessageSquare, Users, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Conversation } from '../../shared/types';

interface ConversationCardProps {
  conversation: Conversation & { segmentCount?: number };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ConversationCard({
  conversation,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: ConversationCardProps) {
  const intl = useIntl();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const statusColor =
    conversation.status === 'recording'
      ? 'bg-red-500'
      : conversation.status === 'processing'
        ? 'bg-yellow-500'
        : 'bg-green-500';

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`group relative flex w-full items-start gap-4 rounded-xl border p-4 text-start transition-all ${
        isSelected
          ? 'border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-950'
          : 'border-gray-200 bg-surface-light hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-surface-dark dark:hover:border-gray-600'
      }`}
    >
      {/* Status dot */}
      <div className="mt-1 flex-shrink-0">
        <span className={`block h-2.5 w-2.5 rounded-full ${statusColor}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {conversation.title}
          </h3>
          <span className="flex-shrink-0 text-xs text-gray-400">
            {formatRelativeDate(conversation.createdAt)}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(conversation.duration)}
          </span>
          {conversation.segmentCount != null && conversation.segmentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {conversation.segmentCount} {intl.formatMessage({ id: 'conversations.segments' })}
            </span>
          )}
          {conversation.speakerCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {conversation.speakerCount}
            </span>
          )}
        </div>

        {/* Tags */}
        {conversation.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {conversation.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Context menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="rounded-lg p-1 text-gray-400 opacity-0 hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute end-0 top-8 z-10 min-w-[140px] rounded-lg border border-gray-200 bg-surface-light py-1 shadow-lg dark:border-gray-700 dark:bg-surface-dark">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                const newTitle = prompt(
                  intl.formatMessage({ id: 'conversations.renamePrompt' }),
                  conversation.title
                );
                if (newTitle && newTitle !== conversation.title) {
                  onRename(conversation.id, newTitle);
                }
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {intl.formatMessage({ id: 'common.edit' })}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                if (confirm(intl.formatMessage({ id: 'conversations.deleteConfirm' }))) {
                  onDelete(conversation.id);
                }
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {intl.formatMessage({ id: 'common.delete' })}
            </button>
          </div>
        )}
      </div>
    </button>
  );
}
