'use client';

import { useState } from 'react';
import { PropertyType } from '@/types/filters';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PropertyTypeFilterProps {
  title?: string;
  propertyTypes: PropertyType[];
  selectedPropertyTypes: string[];
  onChange: (id: string) => void;
  maxHeight?: string;
  isLoading?: boolean;
}

export default function PropertyTypeFilter({
  title = 'Тип недвижимости',
  propertyTypes,
  selectedPropertyTypes,
  onChange,
  maxHeight = '12rem',
  isLoading = false
}: PropertyTypeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (propertyTypes.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-4">
      <button
        type="button"
        className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{title}</span>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      {isExpanded && (
        <div 
          className={`overflow-y-auto pl-1 ${isLoading ? 'opacity-50' : ''}`} 
          style={{ maxHeight }}
        >
          {propertyTypes.map((type) => (
            <div key={type.id} className="mb-1.5 flex items-center">
              <input
                type="checkbox"
                id={`property-type-${type.id}`}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                checked={selectedPropertyTypes.includes(type.id)}
                onChange={() => onChange(type.id)}
                disabled={type.count === 0 || !type.available}
              />
              <label
                htmlFor={`property-type-${type.id}`}
                className={`ml-2 text-sm cursor-pointer ${
                  type.count === 0 || !type.available
                    ? 'text-gray-400'
                    : 'text-gray-700'
                }`}
              >
                {type.name}
                {type.count !== undefined && (
                  <span className="ml-1 text-gray-400">({type.count})</span>
                )}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 