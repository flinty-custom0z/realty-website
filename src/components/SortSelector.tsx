'use client';

import React from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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
  };

  return (
    <select
      className="border rounded p-2 text-sm"
      value={currentValue}
      onChange={handleChange}
      aria-label="Сортировка объявлений"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
} 