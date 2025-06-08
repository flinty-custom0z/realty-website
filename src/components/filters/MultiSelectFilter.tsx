'use client';

import { FilterOption } from '@/types/filters';

export interface MultiSelectFilterProps {
  title: string;
  options: (FilterOption | {
    value: string;
    label?: string;
    count: number;
    available: boolean;
  })[];
  selected: string[];
  onChange: (value: string) => void;
  maxHeight?: string;
}

export function MultiSelectFilter({
  title,
  options,
  selected,
  onChange,
  maxHeight = '12rem'
}: MultiSelectFilterProps) {
  // Always render the component with minimal default content if no options
  // This prevents layout jumps when options are loading or filtered out
  const hasOptions = options.length > 0;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
      <div 
        className="flex flex-wrap gap-2 overflow-y-auto pr-2"
        style={{ maxHeight}}
      >
        {hasOptions ? options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-2.5 py-1.5 rounded-md text-sm transition-all inline-flex items-center ${
              selected.includes(option.value)
                ? 'deal-accent-bg text-white font-medium shadow-sm'
                : option.available
                  ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  : 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
            }`}
            disabled={!option.available && !selected.includes(option.value)}
          >
            <span>{option.label || option.value}</span>
            <span className="ml-1 text-xs opacity-80">({option.count})</span>
          </button>
        )) : (
          // Render placeholders when no options are available
          <div className="w-full flex flex-wrap gap-2">
            <div className="bg-gray-50 px-3 py-2 rounded-md w-20 h-8"></div>
            <div className="bg-gray-50 px-3 py-2 rounded-md w-24 h-8"></div>
            <div className="bg-gray-50 px-3 py-2 rounded-md w-28 h-8"></div>
          </div>
        )}
      </div>
    </div>
  );
} 