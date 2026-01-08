import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, ArrowUpDown } from 'lucide-react';

const priorityBadgeStyles = {
  "A Must Have": "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
  "High": "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  "Medium": "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  "Low": "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
};

const sizeBadgeStyles = {
  "XS": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
  "S": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
  "M": "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300",
  "L": "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300",
  "XL": "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  "XXL": "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
};

function SortHeader({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
    >
      {label}
      <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
        {isActive ? (
          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        ) : (
          <ArrowUpDown size={14} />
        )}
      </span>
    </button>
  );
}

function FeatureRow({ feature, isExpanded, onToggle }) {
  return (
    <>
      <tr
        className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
          isExpanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
        }`}
      >
        <td className="px-4 py-3">
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight
              size={16}
              className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {feature.category}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="font-medium text-gray-900 dark:text-white">{feature.featureName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {feature.description}
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">{feature.designTeam}</span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
            feature.designReady === 'Y'
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            {feature.designReady}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityBadgeStyles[feature.priority]}`}>
            {feature.priority === "A Must Have" ? "Must Have" : feature.priority}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${sizeBadgeStyles[feature.tshirtSize]}`}>
            {feature.tshirtSize}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
            {feature.effortScore}
          </span>
        </td>
      </tr>

      {/* Expanded Row */}
      {isExpanded && (
        <tr className="bg-blue-50/30 dark:bg-blue-900/5 border-b border-gray-100 dark:border-gray-700">
          <td colSpan={8} className="px-4 py-4">
            <div className="ml-8 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Reasoning</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.reasoning}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Competitor Reference</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.competitorReference}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function FeatureTable({ features, sortConfig, onSort }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const expandAll = () => {
    setExpandedRows(new Set(features.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedRows(new Set());
  };

  if (features.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No features match your filters.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {features.length} feature{features.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Expand All
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 w-12"></th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Category" sortKey="category" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Feature" sortKey="featureName" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Team" sortKey="designTeam" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Ready" sortKey="designReady" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Priority" sortKey="priority" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Size" sortKey="tshirtSize" sortConfig={sortConfig} onSort={onSort} />
              </th>
              <th className="px-4 py-3 text-center">
                <SortHeader label="Effort" sortKey="effortScore" sortConfig={sortConfig} onSort={onSort} />
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <FeatureRow
                key={`${feature.category}-${feature.featureName}`}
                feature={feature}
                isExpanded={expandedRows.has(index)}
                onToggle={() => toggleRow(index)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeatureTable;
