import React from 'react';
import { Search, Sparkles, Filter, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search documents, protocols, gene sequences, or ask AI...",
  size = "md",
  showAiBadge = true,
  onFilterClick,
  className = "",
  autoFocus = false
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className={`w-full relative ${className}`}>
      <div className={`relative flex items-center bg-white border border-slate-300 rounded-xl shadow-2xs transition-all duration-150 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 ${
        isLarge ? 'p-1.5 sm:p-2' : 'p-1'
      }`}>
        <div className="pl-3 text-emerald-800 flex items-center">
          {showAiBadge ? <Sparkles className={`${isLarge ? 'w-4.5 h-4.5' : 'w-4 h-4'} text-emerald-700`} /> : <Search className={`${isLarge ? 'w-4.5 h-4.5' : 'w-4 h-4'} text-slate-400`} />}
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none px-3 ${
            isLarge ? 'text-xs sm:text-sm font-normal' : 'text-xs'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            className="p-1.5 text-slate-600 hover:text-emerald-900 hover:bg-slate-100 rounded-lg mr-1 transition-colors flex items-center gap-1 text-xs font-medium border border-slate-200"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        )}

        <button
          type="submit"
          className={`bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            isLarge ? 'px-4 py-2 text-xs sm:text-sm' : 'px-3 py-1.5 text-xs'
          } shadow-2xs`}
        >
          <Search className={`${isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}
