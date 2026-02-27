import { useIntl } from 'react-intl';
import { Bot, Plus } from 'lucide-react';

export function AgentsPage() {
  const intl = useIntl();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {intl.formatMessage({ id: 'agents.title' })}
        </h1>
        <button className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          {intl.formatMessage({ id: 'agents.create' })}
        </button>
      </div>

      {/* Built-in Companions Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              name: 'Meeting Excellence Coach',
              nameAr: 'مدرب التميز في الاجتماعات',
              desc: 'Analyzes meetings for effectiveness and follow-through',
            },
            {
              name: 'Strategic Advisor',
              nameAr: 'المستشار الاستراتيجي',
              desc: 'Strategic analysis and recommendations',
            },
            {
              name: 'Personal Assistant',
              nameAr: 'المساعد الشخصي',
              desc: 'Task management and daily organization',
            },
            {
              name: 'Finance Advisor',
              nameAr: 'المستشار المالي',
              desc: 'Financial discussion analysis and budget tracking',
            },
            {
              name: 'Protocol & Etiquette Coach',
              nameAr: 'مدرب البروتوكول والإتيكيت',
              desc: 'Government protocol and diplomatic etiquette',
            },
          ].map((companion) => (
            <div
              key={companion.name}
              className="cursor-pointer rounded-xl border border-gray-200 bg-surface-light p-5 transition-colors hover:border-brand-300 dark:border-gray-700 dark:bg-surface-dark dark:hover:border-brand-700"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                <Bot className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{companion.name}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{companion.nameAr}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{companion.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
