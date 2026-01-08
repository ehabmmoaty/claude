import { X } from 'lucide-react';
import { tshirtSizePoints } from '../data/features';

const sizeStyles = {
  "XS": { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  "S": { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  "M": { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  "L": { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  "XL": { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  "XXL": { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
};

function TShirtSizingModal({ onClose }) {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            T-Shirt Sizing Reference
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            T-Shirt sizing provides a relative estimation of effort for feature development.
            Points follow the Fibonacci sequence to account for increasing uncertainty with larger items.
          </p>

          <div className="space-y-3">
            {sizes.map(size => {
              const info = tshirtSizePoints[size];
              const style = sizeStyles[size];

              return (
                <div
                  key={size}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${style.border} ${style.bg}`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${style.text} bg-white dark:bg-gray-800`}>
                    {size}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${style.text}`}>
                        {info.points} point{info.points !== 1 ? 's' : ''}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {info.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {getSizeDescription(size)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Estimation Guidelines
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Estimates assume a single developer working full-time</li>
              <li>• Includes design, implementation, testing, and review</li>
              <li>• XXL items should be broken down if possible</li>
              <li>• Add buffer for integrations and dependencies</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function getSizeDescription(size) {
  const descriptions = {
    "XS": "Quick fixes, minor tweaks, simple configuration changes",
    "S": "Small features, bug fixes, simple UI components",
    "M": "Standard features, moderate complexity, some integration",
    "L": "Complex features, significant development, multiple components",
    "XL": "Large initiatives, architectural changes, major integrations",
    "XXL": "Epic-level work, platform changes, consider breaking down",
  };
  return descriptions[size];
}

export default TShirtSizingModal;
