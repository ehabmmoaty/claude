import { useIntl } from 'react-intl';
import {
  Clock,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  MoreHorizontal,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import type { Task } from '../../shared/types';
import { useAppStore } from '../stores/appStore';
import { useConversationsStore } from '../stores/conversationsStore';

const PRIORITY_STYLES = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const STATUS_ICON = {
  todo: Circle,
  in_progress: Loader2,
  done: CheckCircle2,
};

const STATUS_STYLES = {
  todo: 'text-gray-400',
  in_progress: 'text-brand-500 animate-spin',
  done: 'text-green-500',
};

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onStatusChange: (status: Task['status']) => void;
  onDelete: () => void;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 0) return `in ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 7) return `Due in ${diffDays}d`;
  return date.toLocaleDateString();
}

export function TaskCard({ task, isSelected, onSelect, onStatusChange, onDelete }: TaskCardProps) {
  const intl = useIntl();
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const selectConversation = useConversationsStore((s) => s.selectConversation);
  const StatusIcon = STATUS_ICON[task.status];

  const nextStatus: Record<Task['status'], Task['status']> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: 'todo',
  };

  const handleGoToConversation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.sourceConversationId) {
      selectConversation(task.sourceConversationId);
      setActiveTab('conversations');
    }
  };

  const isDueSoon = task.dueDate && new Date(task.dueDate).getTime() - Date.now() < 86400000 * 2 && task.status !== 'done';

  return (
    <div
      onClick={onSelect}
      className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors cursor-pointer ${
        isSelected
          ? 'border-brand-500 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-950/30'
          : 'border-gray-200 bg-surface-light hover:border-gray-300 dark:border-gray-700 dark:bg-surface-dark dark:hover:border-gray-600'
      }`}
    >
      {/* Status toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(nextStatus[task.status]);
        }}
        className="mt-0.5 shrink-0"
        title={intl.formatMessage({ id: `tasks.status.${task.status}` })}
      >
        <StatusIcon className={`h-5 w-5 ${STATUS_STYLES[task.status]}`} />
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm font-medium ${
              task.status === 'done'
                ? 'text-gray-400 line-through dark:text-gray-600'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {task.title}
          </h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {intl.formatMessage({ id: `tasks.priority.${task.priority}` })}
          </span>
        </div>

        {task.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">{task.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${isDueSoon ? 'font-medium text-red-500' : ''}`}>
              {isDueSoon ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              {formatDueDate(task.dueDate)}
            </span>
          )}
          {task.ownerName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.ownerName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeDate(task.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.sourceConversationId && (
          <button
            onClick={handleGoToConversation}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            title="Go to conversation"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
          title={intl.formatMessage({ id: 'common.delete' })}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
