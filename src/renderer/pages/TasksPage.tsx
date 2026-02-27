import { useState } from 'react';
import { useIntl } from 'react-intl';
import { CheckSquare } from 'lucide-react';

type TaskView = 'my_tasks' | 'delegated' | 'waiting_on';

export function TasksPage() {
  const intl = useIntl();
  const [activeView, setActiveView] = useState<TaskView>('my_tasks');

  const views: { id: TaskView; labelKey: string }[] = [
    { id: 'my_tasks', labelKey: 'tasks.myTasks' },
    { id: 'delegated', labelKey: 'tasks.delegated' },
    { id: 'waiting_on', labelKey: 'tasks.waitingOn' },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: 'tasks.title' })}
        </h1>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 border-b border-gray-200 px-6 py-2 dark:border-gray-700">
        {views.map(({ id, labelKey }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeView === id
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            {intl.formatMessage({ id: labelKey })}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-gray-400">
        <CheckSquare className="h-12 w-12" />
        <p className="text-sm">{intl.formatMessage({ id: 'tasks.empty' })}</p>
      </div>
    </div>
  );
}
