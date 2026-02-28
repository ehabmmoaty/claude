import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
  Bot,
  Plus,
  Loader2,
  MessageSquare,
  Sparkles,
  Shield,
  Brain,
  DollarSign,
  Crown,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useAgentsStore } from '../stores/agentsStore';
import type { Companion } from '../../shared/types';

const COMPANION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'meeting-coach': Sparkles,
  'strategic-advisor': Brain,
  'personal-assistant': Bot,
  'finance-advisor': DollarSign,
  'protocol-coach': Crown,
};

const GRADIENT_CLASSES = [
  'from-teal-500 to-cyan-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

function CompanionCard({
  companion,
  stat,
  isSelected,
  onSelect,
  onToggle,
  onDelete,
}: {
  companion: Companion;
  stat: number;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete?: () => void;
}) {
  const intl = useIntl();
  const Icon = COMPANION_ICONS[companion.id] || Bot;
  const gradientIdx =
    companion.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENT_CLASSES.length;

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-xl border p-5 transition-all ${
        isSelected
          ? 'border-brand-500 shadow-md dark:border-brand-600'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600'
      } bg-surface-light dark:bg-surface-dark`}
    >
      {/* Icon */}
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENT_CLASSES[gradientIdx]}`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="font-semibold text-gray-900 dark:text-white">{companion.name}</h3>
      <p className="mt-0.5 text-xs text-gray-400">{companion.nameAr}</p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {companion.description}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <MessageSquare className="h-3 w-3" />
          {intl.formatMessage({ id: 'agents.conversations' }, { count: stat })}
        </span>

        {/* Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="shrink-0"
        >
          {companion.isActive ? (
            <ToggleRight className="h-6 w-6 text-brand-600" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-gray-300" />
          )}
        </button>
      </div>

      {/* Built-in badge */}
      {companion.isBuiltIn && (
        <div className="absolute end-3 top-3">
          <Shield className="h-3.5 w-3.5 text-gray-300" />
        </div>
      )}
    </div>
  );
}

export function AgentsPage() {
  const intl = useIntl();
  const {
    companions,
    stats,
    isLoading,
    selectedCompanionId,
    loadCompanions,
    loadStats,
    selectCompanion,
    toggleActive,
    removeCompanion,
  } = useAgentsStore();

  useEffect(() => {
    loadCompanions();
    loadStats();
  }, []);

  const selected = companions.find((c) => c.id === selectedCompanionId);
  const builtIn = companions.filter((c) => c.isBuiltIn);
  const custom = companions.filter((c) => !c.isBuiltIn);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {intl.formatMessage({ id: 'agents.title' })}
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              {intl.formatMessage({ id: 'agents.subtitle' })}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          ) : (
            <>
              {/* Built-in */}
              <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {intl.formatMessage({ id: 'agents.builtIn' })}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {builtIn.map((c) => (
                  <CompanionCard
                    key={c.id}
                    companion={c}
                    stat={stats[c.id] || 0}
                    isSelected={selectedCompanionId === c.id}
                    onSelect={() => selectCompanion(c.id === selectedCompanionId ? null : c.id)}
                    onToggle={() => toggleActive(c.id, !c.isActive)}
                  />
                ))}
              </div>

              {/* Custom */}
              {custom.length > 0 && (
                <>
                  <h2 className="mb-4 mt-8 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {intl.formatMessage({ id: 'agents.custom' })}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {custom.map((c) => (
                      <CompanionCard
                        key={c.id}
                        companion={c}
                        stat={stats[c.id] || 0}
                        isSelected={selectedCompanionId === c.id}
                        onSelect={() => selectCompanion(c.id === selectedCompanionId ? null : c.id)}
                        onToggle={() => toggleActive(c.id, !c.isActive)}
                        onDelete={() => {
                          if (confirm(intl.formatMessage({ id: 'agents.deleteConfirm' }))) {
                            removeCompanion(c.id);
                          }
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail sidebar */}
      {selected && (
        <div className="w-80 flex-shrink-0 overflow-y-auto border-s border-gray-200 bg-surface-light px-5 py-5 dark:border-gray-700 dark:bg-surface-dark">
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${
                GRADIENT_CLASSES[selected.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENT_CLASSES.length]
              }`}
            >
              {(() => {
                const Icon = COMPANION_ICONS[selected.id] || Bot;
                return <Icon className="h-5 w-5 text-white" />;
              })()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{selected.name}</h3>
              <p className="text-xs text-gray-400">{selected.nameAr}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">
                {intl.formatMessage({ id: 'agents.description' })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selected.description}</p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">
                {intl.formatMessage({ id: 'agents.descriptionAr' })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400" dir="rtl">
                {selected.descriptionAr}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">
                {intl.formatMessage({ id: 'agents.systemPrompt' })}
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg bg-muted-light p-3 text-xs text-gray-600 dark:bg-muted-dark dark:text-gray-400">
                {selected.systemPrompt}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">
                {intl.formatMessage({ id: 'conversations.status' })}
              </p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  selected.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {selected.isActive
                  ? intl.formatMessage({ id: 'agents.active' })
                  : intl.formatMessage({ id: 'agents.inactive' })}
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">
                {intl.formatMessage({ id: 'agents.conversations' }, { count: stats[selected.id] || 0 })}
              </p>
            </div>

            {selected.isBuiltIn && (
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Shield className="h-3 w-3" />
                {intl.formatMessage({ id: 'agents.builtInNote' })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
