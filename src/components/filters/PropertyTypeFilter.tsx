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
            <label
              key={type.id}
              htmlFor={`property-type-${type.id}`}
              className={`custom-checkbox mb-2 ${(
                !type.available || type.count === 0) && !selectedPropertyTypes.includes(type.id)
                  ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                id={`property-type-${type.id}`}
                checked={selectedPropertyTypes.includes(type.id)}
                onChange={() => onChange(type.id)}
                disabled={(!type.available || type.count === 0) && !selectedPropertyTypes.includes(type.id)}
              />
              <span className="checkbox-icon"></span>
              <span className={`text-sm ${selectedPropertyTypes.includes(type.id) ? 'font-medium text-gray-900' : 'text-gray-700'}`}
              >
                {type.name}
                {type.count !== undefined && (
                  <span className="ml-1 text-gray-400">({type.count})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
} 