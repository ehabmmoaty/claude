import { useState, useMemo, useEffect } from 'react';
import { Sun, Moon, Table, LayoutGrid, Info, Download, Printer } from 'lucide-react';
import { features, categories, priorities, tshirtSizes, designTeams, priorityOrder, tshirtSizeOrder } from './data/features';
import Dashboard from './components/Dashboard';
import FilterBar from './components/FilterBar';
import FeatureTable from './components/FeatureTable';
import KanbanBoard from './components/KanbanBoard';
import TShirtSizingModal from './components/TShirtSizingModal';
import { exportToCSV } from './utils/export';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [view, setView] = useState('table');
  const [showSizingModal, setShowSizingModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedDesignTeam, setSelectedDesignTeam] = useState('');
  const [selectedDesignReady, setSelectedDesignReady] = useState('');

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'priority', direction: 'asc' });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          feature.featureName,
          feature.description,
          feature.category,
          feature.reasoning,
          feature.competitorReference
        ].map(f => (f || '').toLowerCase());

        if (!searchFields.some(field => field.includes(query))) {
          return false;
        }
      }

      // Priority filter
      if (selectedPriorities.length > 0 && !selectedPriorities.includes(feature.priority)) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(feature.category)) {
        return false;
      }

      // T-Shirt size filter
      if (selectedSizes.length > 0 && !selectedSizes.includes(feature.tshirtSize)) {
        return false;
      }

      // Design team filter
      if (selectedDesignTeam && feature.designTeam !== selectedDesignTeam) {
        return false;
      }

      // Design ready filter
      if (selectedDesignReady && feature.designReady !== selectedDesignReady) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedPriorities, selectedCategories, selectedSizes, selectedDesignTeam, selectedDesignReady]);

  const sortedFeatures = useMemo(() => {
    const sorted = [...filteredFeatures];

    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Special sorting for priority
      if (sortConfig.key === 'priority') {
        aVal = priorityOrder[aVal] || 99;
        bVal = priorityOrder[bVal] || 99;
      }

      // Special sorting for T-shirt size
      if (sortConfig.key === 'tshirtSize') {
        aVal = tshirtSizeOrder[aVal] || 99;
        bVal = tshirtSizeOrder[bVal] || 99;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredFeatures, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPriorities([]);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedDesignTeam('');
    setSelectedDesignReady('');
  };

  const hasActiveFilters = searchQuery || selectedPriorities.length > 0 ||
    selectedCategories.length > 0 || selectedSizes.length > 0 ||
    selectedDesignTeam || selectedDesignReady;

  const handleExport = () => {
    exportToCSV(sortedFeatures);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 no-print">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Product Feature Catalog
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {sortedFeatures.length} of {features.length} features
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSizingModal(true)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="T-Shirt Sizing Reference"
              >
                <Info size={20} />
              </button>

              <button
                onClick={handleExport}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Export to CSV"
              >
                <Download size={20} />
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Print"
              >
                <Printer size={20} />
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-600 mx-1" />

              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setView('table')}
                  className={`p-1.5 rounded-md transition-colors ${
                    view === 'table'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Table View"
                >
                  <Table size={18} />
                </button>
                <button
                  onClick={() => setView('kanban')}
                  className={`p-1.5 rounded-md transition-colors ${
                    view === 'kanban'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Kanban View"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard */}
        <Dashboard features={features} filteredFeatures={sortedFeatures} />

        {/* Filters */}
        <div className="no-print">
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPriorities={selectedPriorities}
            setSelectedPriorities={setSelectedPriorities}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedDesignTeam={selectedDesignTeam}
            setSelectedDesignTeam={setSelectedDesignTeam}
            selectedDesignReady={selectedDesignReady}
            setSelectedDesignReady={setSelectedDesignReady}
            categories={categories}
            priorities={priorities}
            tshirtSizes={tshirtSizes}
            designTeams={designTeams}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />
        </div>

        {/* Content */}
        {view === 'table' ? (
          <FeatureTable
            features={sortedFeatures}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        ) : (
          <KanbanBoard features={sortedFeatures} />
        )}
      </main>

      {/* T-Shirt Sizing Modal */}
      {showSizingModal && (
        <TShirtSizingModal onClose={() => setShowSizingModal(false)} />
      )}
    </div>
  );
}

export default App;
