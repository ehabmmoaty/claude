import { useMemo } from 'react';

const priorityConfig = {
  "A Must Have": {
    label: "Must Have",
    headerBg: "bg-green-500",
    cardBorder: "border-l-green-500",
    badge: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
  },
  "High": {
    label: "High Priority",
    headerBg: "bg-yellow-500",
    cardBorder: "border-l-yellow-500",
    badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300",
  },
  "Medium": {
    label: "Medium Priority",
    headerBg: "bg-blue-500",
    cardBorder: "border-l-blue-500",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  },
  "Low": {
    label: "Low Priority",
    headerBg: "bg-gray-400",
    cardBorder: "border-l-gray-400",
    badge: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
  },
};

const sizeBadgeStyles = {
  "XS": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  "S": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  "M": "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  "L": "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
  "XL": "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  "XXL": "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

function FeatureCard({ feature }) {
  const config = priorityConfig[feature.priority];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${config.cardBorder} p-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
          {feature.featureName}
        </h4>
        <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${sizeBadgeStyles[feature.tshirtSize]}`}>
          {feature.tshirtSize}
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
        {feature.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          {feature.category}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${feature.designReady === 'Y' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {feature.designReady === 'Y' ? 'Ready' : 'Pending'}
          </span>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            {feature.effortScore}
          </span>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ priority, features }) {
  const config = priorityConfig[priority];
  const totalEffort = features.reduce((sum, f) => sum + f.effortScore, 0);

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column Header */}
      <div className={`${config.headerBg} rounded-t-lg px-4 py-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{config.label}</h3>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
              {features.length}
            </span>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
              {totalEffort} pts
            </span>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800/50 rounded-b-lg p-3 space-y-3 min-h-[200px] overflow-y-auto max-h-[calc(100vh-320px)]">
        {features.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No features
          </div>
        ) : (
          features.map(feature => (
            <FeatureCard
              key={`${feature.category}-${feature.featureName}`}
              feature={feature}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanBoard({ features }) {
  const priorityOrder = ["A Must Have", "High", "Medium", "Low"];

  const featuresByPriority = useMemo(() => {
    const grouped = {};
    priorityOrder.forEach(priority => {
      grouped[priority] = [];
    });

    features.forEach(feature => {
      if (grouped[feature.priority]) {
        grouped[feature.priority].push(feature);
      }
    });

    return grouped;
  }, [features]);

  if (features.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No features match your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-min">
        {priorityOrder.map(priority => (
          <KanbanColumn
            key={priority}
            priority={priority}
            features={featuresByPriority[priority]}
          />
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;
