import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';

function MultiSelect({ label, options, selected, onChange, renderOption }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm
          ${selected.length > 0
            ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {selected.length}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1 max-h-64 overflow-y-auto">
          {options.map(option => (
            <label
              key={option}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              {renderOption ? renderOption(option) : (
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedPriorities,
  setSelectedPriorities,
  selectedCategories,
  setSelectedCategories,
  selectedSizes,
  setSelectedSizes,
  selectedDesignTeam,
  setSelectedDesignTeam,
  selectedDesignReady,
  setSelectedDesignReady,
  categories,
  priorities,
  tshirtSizes,
  designTeams,
  hasActiveFilters,
  clearFilters,
}) {
  const priorityColors = {
    "A Must Have": "text-green-600 dark:text-green-400",
    "High": "text-yellow-600 dark:text-yellow-400",
    "Medium": "text-blue-600 dark:text-blue-400",
    "Low": "text-gray-600 dark:text-gray-400",
  };

  const sizeColors = {
    "XS": "text-emerald-600 dark:text-emerald-400",
    "S": "text-emerald-600 dark:text-emerald-400",
    "M": "text-orange-600 dark:text-orange-400",
    "L": "text-orange-600 dark:text-orange-400",
    "XL": "text-red-600 dark:text-red-400",
    "XXL": "text-red-600 dark:text-red-400",
  };

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={18} className="text-gray-400 hidden sm:block" />

          <MultiSelect
            label="Priority"
            options={priorities}
            selected={selectedPriorities}
            onChange={setSelectedPriorities}
            renderOption={(option) => (
              <span className={`text-sm font-medium ${priorityColors[option]}`}>
                {option === "A Must Have" ? "Must Have" : option}
              </span>
            )}
          />

          <MultiSelect
            label="Category"
            options={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />

          <MultiSelect
            label="T-Shirt Size"
            options={tshirtSizes}
            selected={selectedSizes}
            onChange={setSelectedSizes}
            renderOption={(option) => (
              <span className={`text-sm font-medium ${sizeColors[option]}`}>
                {option}
              </span>
            )}
          />

          {/* Design Team */}
          <select
            value={selectedDesignTeam}
            onChange={(e) => setSelectedDesignTeam(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors
              ${selectedDesignTeam
                ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            <option value="">Design Team</option>
            {designTeams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          {/* Design Ready */}
          <select
            value={selectedDesignReady}
            onChange={(e) => setSelectedDesignReady(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors
              ${selectedDesignReady
                ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            <option value="">Design Ready</option>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
