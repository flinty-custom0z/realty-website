'use client';

import { useState } from 'react';
import useSWR from 'swr';
import FilterSidebar from './FilterSidebar';
import ListingCard from './ListingCard';
import SortSelector from './SortSelector';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ListingsWithFilters({
  initialListings,
  initialPagination,
  initialFilters,
  categories,
}) {
  const [filters, setFilters] = useState(initialFilters);

  // Build query string from filters
  const query = new URLSearchParams(filters).toString();
  const { data, isValidating } = useSWR(
    `/api/listings?${query}`,
    fetcher,
    { fallbackData: { listings: initialListings, pagination: initialPagination } }
  );

  // Handler to update filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
        <FilterSidebar
          categories={categories}
          filters={filters}
          onChange={handleFilterChange}
        />
      </div>
      {/* Listings */}
      <div className="w-full md:w-3/4" id="listings-section">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {data.pagination.total > 0
              ? `Отображаются ${(data.pagination.page - 1) * data.pagination.limit + 1}‑${Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total,
                )} из ${data.pagination.total} результатов`
              : 'Нет результатов'}
          </p>
          <SortSelector filters={filters} onChange={handleFilterChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.listings.map((l) => (
            <ListingCard key={l.id} {...l} />
          ))}
        </div>
        {/* Pagination, etc. */}
      </div>
    </div>
  );
}