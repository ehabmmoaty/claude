/**
 * AnalyticsPage — Meeting statistics, conversation insights, and usage trends.
 * This is embedded in the HomePage as an "insights" section rather than a separate tab.
 */

import { useIntl } from 'react-intl';
import {
  Clock,
  MessageSquare,
  Users,
  TrendingUp,
  Mic,
  CheckSquare,
  Calendar,
  Globe,
  BarChart3,
} from 'lucide-react';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface-light p-5 dark:border-gray-700 dark:bg-surface-dark">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
      {change && (
        <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
          <TrendingUp className="h-3 w-3" />
          {change}
        </p>
      )}
    </div>
  );
}

interface BarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function HorizontalBar({ label, value, max, color }: BarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-gray-500 text-end">{label}</span>
      <div className="flex-1">
        <div className="h-4 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className={`h-4 rounded-full ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="w-8 text-xs font-medium text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  );
}

// Mock analytics data for web preview
const MOCK_ANALYTICS = {
  totalConversations: 47,
  totalDuration: 2340, // minutes
  totalSpeakers: 28,
  totalTasks: 23,
  avgDuration: 49, // minutes
  weeklyConversations: [3, 5, 4, 7, 6, 8, 5],
  topSpeakers: [
    { name: 'Ahmed Al Mansouri', count: 42 },
    { name: 'Fatima Al Hashimi', count: 38 },
    { name: 'Omar Al Suwaidi', count: 29 },
    { name: 'Sara Al Ketbi', count: 24 },
    { name: 'Khalid Al Dhaheri', count: 18 },
  ],
  languageBreakdown: { en: 62, ar: 38 },
  taskCompletion: { done: 14, in_progress: 5, todo: 4 },
  weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export function AnalyticsSection() {
  const intl = useIntl();
  const data = MOCK_ANALYTICS;
  const maxSpeaker = Math.max(...data.topSpeakers.map((s) => s.count));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label={intl.formatMessage({ id: 'analytics.totalConversations' })}
          value={String(data.totalConversations)}
          change={intl.formatMessage({ id: 'analytics.changeUp' }, { pct: '12' })}
          color="bg-blue-500"
        />
        <StatCard
          icon={Clock}
          label={intl.formatMessage({ id: 'analytics.totalHours' })}
          value={`${Math.round(data.totalDuration / 60)}h`}
          change={intl.formatMessage({ id: 'analytics.changeUp' }, { pct: '8' })}
          color="bg-purple-500"
        />
        <StatCard
          icon={Users}
          label={intl.formatMessage({ id: 'analytics.uniqueSpeakers' })}
          value={String(data.totalSpeakers)}
          color="bg-teal-500"
        />
        <StatCard
          icon={CheckSquare}
          label={intl.formatMessage({ id: 'analytics.tasksExtracted' })}
          value={String(data.totalTasks)}
          change={intl.formatMessage({ id: 'analytics.changeUp' }, { pct: '15' })}
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <div className="rounded-xl border border-gray-200 bg-surface-light p-5 dark:border-gray-700 dark:bg-surface-dark">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'analytics.weeklyActivity' })}
            </h3>
          </div>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {data.weeklyConversations.map((count, i) => {
              const max = Math.max(...data.weeklyConversations);
              const h = max > 0 ? (count / max) * 100 : 0;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{count}</span>
                  <div
                    className="w-full rounded-t-md bg-brand-500"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-xs text-gray-400">{data.weekDays[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Speakers */}
        <div className="rounded-xl border border-gray-200 bg-surface-light p-5 dark:border-gray-700 dark:bg-surface-dark">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'analytics.topSpeakers' })}
            </h3>
          </div>
          <div className="space-y-2.5">
            {data.topSpeakers.map((speaker) => (
              <HorizontalBar
                key={speaker.name}
                label={speaker.name.split(' ').slice(0, 2).join(' ')}
                value={speaker.count}
                max={maxSpeaker}
                color="bg-brand-500"
              />
            ))}
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-surface-light p-5 dark:border-gray-700 dark:bg-surface-dark">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'analytics.languageBreakdown' })}
            </h3>
          </div>
          <div className="flex items-center gap-6">
            {/* Donut-like display */}
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" className="dark:stroke-gray-700" />
                <circle
                  cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4"
                  strokeDasharray={`${data.languageBreakdown.en * 0.88} ${88 - data.languageBreakdown.en * 0.88}`}
                />
                <circle
                  cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4"
                  strokeDasharray={`${data.languageBreakdown.ar * 0.88} ${88 - data.languageBreakdown.ar * 0.88}`}
                  strokeDashoffset={`${-data.languageBreakdown.en * 0.88}`}
                />
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  English — {data.languageBreakdown.en}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Arabic — {data.languageBreakdown.ar}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Completion */}
        <div className="rounded-xl border border-gray-200 bg-surface-light p-5 dark:border-gray-700 dark:bg-surface-dark">
          <div className="mb-4 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'analytics.taskCompletion' })}
            </h3>
          </div>
          <div className="space-y-2.5">
            <HorizontalBar
              label={intl.formatMessage({ id: 'tasks.status.done' })}
              value={data.taskCompletion.done}
              max={data.totalTasks}
              color="bg-green-500"
            />
            <HorizontalBar
              label={intl.formatMessage({ id: 'tasks.status.in_progress' })}
              value={data.taskCompletion.in_progress}
              max={data.totalTasks}
              color="bg-blue-500"
            />
            <HorizontalBar
              label={intl.formatMessage({ id: 'tasks.status.todo' })}
              value={data.taskCompletion.todo}
              max={data.totalTasks}
              color="bg-gray-400"
            />
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">
            {Math.round((data.taskCompletion.done / data.totalTasks) * 100)}% {intl.formatMessage({ id: 'analytics.completionRate' })}
          </p>
        </div>
      </div>
    </div>
  );
}
