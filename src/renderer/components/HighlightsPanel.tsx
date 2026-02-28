/**
 * HighlightsPanel — Displays key points, decisions, commitments, and action items
 * extracted from a conversation.
 */

import { useIntl } from 'react-intl';
import { Lightbulb, CheckCircle2, Handshake, ListTodo } from 'lucide-react';
import type { Highlight } from '../services/conversationService';

interface HighlightsPanelProps {
  highlights: Highlight[];
}

const TYPE_CONFIG = {
  key_point: {
    icon: Lightbulb,
    labelId: 'conversations.highlights.keyPoint',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
  },
  decision: {
    icon: CheckCircle2,
    labelId: 'conversations.highlights.decision',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
  },
  commitment: {
    icon: Handshake,
    labelId: 'conversations.highlights.commitment',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
  },
  action_item: {
    icon: ListTodo,
    labelId: 'conversations.highlights.actionItem',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
  },
} as const;

export function HighlightsPanel({ highlights }: HighlightsPanelProps) {
  const intl = useIntl();

  if (highlights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-sm text-gray-400">
        <Lightbulb className="mb-2 h-8 w-8" />
        <p>{intl.formatMessage({ id: 'conversations.highlights.empty' })}</p>
      </div>
    );
  }

  // Group by type
  const grouped = highlights.reduce(
    (acc, h) => {
      (acc[h.type] ??= []).push(h);
      return acc;
    },
    {} as Record<string, Highlight[]>
  );

  return (
    <div className="space-y-4 px-4 py-3">
      {Object.entries(grouped).map(([type, items]) => {
        const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <div key={type}>
            <div className={`mb-2 flex items-center gap-2 ${config.color}`}>
              <Icon className="h-4 w-4" />
              <span className="text-xs font-semibold">
                {intl.formatMessage({ id: config.labelId })}
                <span className="ms-1 text-gray-400">({items.length})</span>
              </span>
            </div>

            <div className="space-y-2">
              {items.map((highlight) => (
                <div
                  key={highlight.id}
                  className={`rounded-lg border p-3 ${config.bg} ${config.border}`}
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {highlight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
