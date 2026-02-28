import { useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import {
  CheckSquare,
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  Loader2,
  ListTodo,
  Users,
  Clock,
} from 'lucide-react';
import { useTasksStore } from '../stores/tasksStore';
import { TaskCard } from '../components/TaskCard';
import type { TaskCategory } from '../services/taskService';

const CATEGORY_ICONS: Record<TaskCategory, React.ComponentType<{ className?: string }>> = {
  my_tasks: ListTodo,
  delegated: Users,
  waiting_on: Clock,
};

export function TasksPage() {
  const intl = useIntl();
  const {
    tasks,
    isLoading,
    category,
    statusFilter,
    priorityFilter,
    searchQuery,
    sortOrder,
    counts,
    selectedTaskId,
    loadTasks,
    loadCounts,
    setCategory,
    setStatusFilter,
    setPriorityFilter,
    setSearchQuery,
    toggleSortOrder,
    selectTask,
    changeTaskStatus,
    removeTask,
  } = useTasksStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    loadTasks();
    loadCounts();
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(t);
  }, [localSearch, setSearchQuery]);

  const categories: { id: TaskCategory; labelKey: string }[] = [
    { id: 'my_tasks', labelKey: 'tasks.myTasks' },
    { id: 'delegated', labelKey: 'tasks.delegated' },
    { id: 'waiting_on', labelKey: 'tasks.waitingOn' },
  ];

  const statusFilters = [
    { value: null, labelKey: 'conversations.filter.all' },
    { value: 'todo' as const, labelKey: 'tasks.status.todo' },
    { value: 'in_progress' as const, labelKey: 'tasks.status.in_progress' },
    { value: 'done' as const, labelKey: 'tasks.status.done' },
  ];

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {intl.formatMessage({ id: 'tasks.title' })}
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            {intl.formatMessage({ id: 'tasks.subtitle' })}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 border-b border-gray-200 px-6 py-2 dark:border-gray-700">
        {categories.map(({ id, labelKey }) => {
          const Icon = CATEGORY_ICONS[id];
          const isActive = category === id;
          return (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {intl.formatMessage({ id: labelKey })}
              {counts[id] > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isActive ? 'bg-brand-200 text-brand-800 dark:bg-brand-800 dark:text-brand-200' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {counts[id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-3 dark:border-gray-700">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={intl.formatMessage({ id: 'tasks.search' })}
            className="w-full rounded-lg border border-gray-200 bg-muted-light py-2 pe-3 ps-9 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-muted-dark dark:text-white"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1">
          {statusFilters.map(({ value, labelKey }) => (
            <button
              key={labelKey}
              onClick={() => setStatusFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {intl.formatMessage({ id: labelKey })}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button
          onClick={toggleSortOrder}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {intl.formatMessage({ id: sortOrder === 'desc' ? 'conversations.sort.newest' : 'conversations.sort.oldest' })}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-400">
              <CheckSquare className="h-12 w-12" />
              <p className="text-sm">{intl.formatMessage({ id: 'tasks.empty' })}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={() => selectTask(task.id === selectedTaskId ? null : task.id)}
                  onStatusChange={(status) => changeTaskStatus(task.id, status)}
                  onDelete={() => {
                    if (confirm(intl.formatMessage({ id: 'tasks.deleteConfirm' }))) {
                      removeTask(task.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Sidebar */}
        {selectedTask && (
          <div className="w-80 flex-shrink-0 overflow-y-auto border-s border-gray-200 bg-surface-light px-5 py-5 dark:border-gray-700 dark:bg-surface-dark">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              {selectedTask.title}
            </h3>
            {selectedTask.description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {selectedTask.description}
              </p>
            )}

            <div className="mt-6 space-y-4">
              {/* Status */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500">
                  {intl.formatMessage({ id: 'conversations.status' })}
                </p>
                <div className="flex gap-1">
                  {(['todo', 'in_progress', 'done'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => changeTaskStatus(selectedTask.id, s)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedTask.status === s
                          ? s === 'done'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : s === 'in_progress'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                      }`}
                    >
                      {intl.formatMessage({ id: `tasks.status.${s}` })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500">
                  {intl.formatMessage({ id: 'tasks.priorityLabel' })}
                </p>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => useTasksStore.getState().editTask(selectedTask.id, { priority: p })}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedTask.priority === p
                          ? p === 'urgent'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : p === 'high'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                              : p === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                      }`}
                    >
                      {intl.formatMessage({ id: `tasks.priority.${p}` })}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              {selectedTask.ownerName && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">
                    {intl.formatMessage({ id: 'tasks.assignee' })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedTask.ownerName}</p>
                </div>
              )}

              {/* Due Date */}
              {selectedTask.dueDate && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">
                    {intl.formatMessage({ id: 'tasks.dueDate' })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(selectedTask.dueDate).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Created */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-500">
                  {intl.formatMessage({ id: 'tasks.created' })}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(selectedTask.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
