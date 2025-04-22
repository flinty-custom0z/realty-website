'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'dateAdded_desc', label: 'Дата (новые)' },
  { value: 'price_asc', label: 'Цена (от низкой)' },
  { value: 'price_desc', label: 'Цена (от высокой)' },
];

interface SortSelectorProps {
  filters?: Record<string, any>;
  onChange?: (filters: Record<string, any>) => void;
}

export default function SortSelector({ filters, onChange }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Controlled mode if filters and onChange are provided
  const isControlled = typeof filters !== 'undefined' && typeof onChange === 'function';

  let sort = 'dateAdded';
  let order = 'desc';
  if (isControlled) {
    sort = filters.sort || 'dateAdded';
    order = filters.order || 'desc';
  } else {
    // Uncontrolled: use URL params
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const searchParams = require('next/navigation').useSearchParams();
    sort = searchParams.get('sort') || 'dateAdded';
    order = searchParams.get('order') || 'desc';
  }
  const currentValue = `${sort}_${order}`;
  
  // Find current option for display
  const currentOption = SORT_OPTIONS.find(opt => opt.value === currentValue) || SORT_OPTIONS[0];

  const handleSelect = (value: string) => {
    let [sortField, sortOrder] = value.split('_');
    if (!sortField) sortField = 'dateAdded';
    if (!sortOrder) sortOrder = 'desc';

    if (isControlled && onChange) {
      onChange({ ...filters, sort: sortField, order: sortOrder, page: 1 });
    } else {
      // Uncontrolled: update URL
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const searchParams = require('next/navigation').useSearchParams();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const pathname = require('next/navigation').usePathname();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = require('next/navigation').useRouter();
      // Convert entries to string[][]
      const entries = Array.from(searchParams.entries()) as [string, string | string[]][];
      const params = new URLSearchParams(
        entries.flatMap(([k, v]) =>
          Array.isArray(v)
            ? v.map((vv: string) => [k, vv])
            : [[k, v]]
        )
      );
      params.set('sort', sortField);
      params.set('order', sortOrder);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
    
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-700">Сортировка:</span>
        <span className="font-medium text-gray-900">{currentOption.label}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <ul
            className="py-1"
            role="listbox"
            aria-label="Сортировка объявлений"
          >
            {SORT_OPTIONS.map((opt) => (
              <li
                key={opt.value}
                role="option"
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                  opt.value === currentValue ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
                }`}
                aria-selected={opt.value === currentValue}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}