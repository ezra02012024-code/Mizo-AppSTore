import React from 'react';
import { Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { APP_CATEGORIES } from '../data/initialApps.ts';
import type { AppCategory } from '../types/appStore.ts';

interface CategoryFilterProps {
  selectedCategory: AppCategory;
  onSelectCategory: (cat: AppCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'popular' | 'latest' | 'rating';
  onSortChange: (sort: 'popular' | 'latest' | 'rating') => void;
  filteredCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filteredCount,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="App hming, developer, emaw package zawnna..."
            className="w-full pl-10 pr-9 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs text-slate-400 hidden md:inline">Rem dan:</span>
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => onSortChange('popular')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sortBy === 'popular'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              A lar zual
            </button>
            <button
              onClick={() => onSortChange('latest')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sortBy === 'latest'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              A thar ber
            </button>
            <button
              onClick={() => onSortChange('rating')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sortBy === 'rating'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rating sang
            </button>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scroll / Wrap */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {APP_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat.nameMizo}
            </button>
          );
        })}
      </div>

      {/* Query count indicator if searching */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            "{searchQuery}" atana hmuh zat: <strong className="text-white font-mono">{filteredCount}</strong>
          </span>
          <button
            onClick={() => onSearchChange('')}
            className="text-emerald-400 hover:underline"
          >
            Zawnna nuaibo rawh
          </button>
        </div>
      )}
    </div>
  );
};
