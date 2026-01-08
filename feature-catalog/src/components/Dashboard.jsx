import { useMemo } from 'react';
import { BarChart3, CheckCircle2, Clock, Layers, Target, TrendingUp } from 'lucide-react';

const priorityColors = {
  "A Must Have": { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  "High": { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  "Medium": { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  "Low": { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
};

const sizeColors = {
  "XS": { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  "S": { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  "M": { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  "L": { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  "XL": { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  "XXL": { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

function Dashboard({ features, filteredFeatures }) {
  const stats = useMemo(() => {
    const totalFeatures = features.length;
    const filteredCount = filteredFeatures.length;
    const totalEffort = filteredFeatures.reduce((sum, f) => sum + f.effortScore, 0);

    // Priority breakdown
    const byPriority = {};
    filteredFeatures.forEach(f => {
      if (!byPriority[f.priority]) {
        byPriority[f.priority] = { count: 0, effort: 0 };
      }
      byPriority[f.priority].count++;
      byPriority[f.priority].effort += f.effortScore;
    });

    // Size breakdown
    const bySize = {};
    filteredFeatures.forEach(f => {
      if (!bySize[f.tshirtSize]) {
        bySize[f.tshirtSize] = 0;
      }
      bySize[f.tshirtSize]++;
    });

    // Design ready
    const designReady = filteredFeatures.filter(f => f.designReady === 'Y').length;
    const designPending = filteredCount - designReady;

    return {
      totalFeatures,
      filteredCount,
      totalEffort,
      byPriority,
      bySize,
      designReady,
      designPending,
    };
  }, [features, filteredFeatures]);

  const priorityOrder = ["A Must Have", "High", "Medium", "Low"];
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
      {/* Total Features */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Features</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.filteredCount}</p>
          </div>
        </div>
      </div>

      {/* Total Effort */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Effort</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEffort} pts</p>
          </div>
        </div>
      </div>

      {/* Design Ready */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Design Ready</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.designReady}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                / {stats.filteredCount}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">By Priority</p>
        </div>
        <div className="space-y-1.5">
          {priorityOrder.map(priority => {
            const data = stats.byPriority[priority];
            if (!data) return null;
            return (
              <div key={priority} className="flex items-center justify-between text-sm">
                <span className={`${priorityColors[priority].text}`}>
                  {priority === "A Must Have" ? "Must Have" : priority}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.count} <span className="text-gray-400 dark:text-gray-500">({data.effort}pts)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Size Distribution */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">By Size</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizeOrder.map(size => {
            const count = stats.bySize[size];
            if (!count) return null;
            return (
              <span
                key={size}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sizeColors[size].bg} ${sizeColors[size].text}`}
              >
                {size}: {count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
