'use client';

import { Category } from '@/types/filters';

export interface CategoryFilterProps {
  categories: Category[];
  selected: string[];
  onChange: (category: string) => void;
  getCategoryAvailability: (slug: string) => boolean;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
  getCategoryAvailability
}: CategoryFilterProps) {
  // Always render the component with minimal default content if no categories
  // This prevents layout jumps when categories are loading
  const hasCategories = categories.length > 0;

  return (
    <div className="min-h-[90px]">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Категории</h4>
      <div className="flex flex-wrap gap-2 min-h-[50px]">
        {hasCategories ? categories.map((cat) => {
          const isAvailable = getCategoryAvailability(cat.slug);
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onChange(cat.slug)}
              className={`px-2.5 py-1.5 rounded-md text-sm transition-all inline-flex items-center ${
                selected.includes(cat.slug)
                  ? 'deal-accent-bg text-white font-medium shadow-sm'
                  : isAvailable
                    ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    : 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
              }`}
              disabled={!isAvailable && !selected.includes(cat.slug)}
            >
              {cat.name}
              {cat.count !== undefined && (
                <span className="ml-1 text-xs opacity-80">({cat.count})</span>
              )}
            </button>
          );
        }) : (
          // Render placeholders when no categories are available
          <div className="w-full flex flex-wrap gap-2">
            <div className="bg-gray-50 px-3 py-2 rounded-md w-24 h-8"></div>
            <div className="bg-gray-50 px-3 py-2 rounded-md w-20 h-8"></div>
            <div className="bg-gray-50 px-3 py-2 rounded-md w-28 h-8"></div>
          </div>
        )}
      </div>
    </div>
  );
} 