'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import React from 'react';

const SORT_OPTIONS = [
  { value: 'dateAdded_desc', label: 'Дата (новые)' },
  { value: 'price_asc', label: 'Цена (от низкой)' },
  { value: 'price_desc', label: 'Цена (от высокой)' },
];

export default function SortSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Determine current sort/order from params
  const sort = searchParams.get('sort') || 'dateAdded';
  const order = searchParams.get('order') || 'desc';
  const currentValue = `${sort}_${order}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let [sortField, sortOrder] = value.split('_');
    if (!sortField) sortField = 'dateAdded';
    if (!sortOrder) sortOrder = 'desc';

    // Build new search params
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('sort', sortField);
    params.set('order', sortOrder);
    params.set('page', '1'); // Reset to first page on sort change

    router.push(`${pathname}?${params.toString()}`);
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