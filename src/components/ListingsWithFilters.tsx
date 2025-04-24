'use client';

import { useState } from 'react';
import useSWR from 'swr';
import FilterSidebar from './FilterSidebar';
import ListingCard from './ListingCard';
import SortSelector from './SortSelector';
import { Category } from '@prisma/client';
import { FC } from 'react';

interface Listing {
  id: string;
  title: string;
  price: number;
  listingCode: string;
  status: string;
  dealType: 'SALE' | 'RENT';
  category: {
    name: string;
  };
  images: {
    path: string;
  }[];
  dateAdded: string;
  district: string;
  address: string;
  rooms?: number;
  houseArea?: number;
  floor?: number;
  totalFloors?: number;
  condition?: string;
}

// Add a type safe status helper function
function mapListingStatus(status: string): 'active' | 'inactive' | undefined {
  if (status === 'active') return 'active';
  if (status === 'inactive') return 'inactive';
  return undefined;
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface ListingsWithFiltersProps {
  initialListings: Listing[];
  initialPagination: PaginationData;
  initialFilters: Record<string, any>;
  categories: Category[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Helper to build query string with repeated params for arrays
function buildQueryString(filters: Record<string, any>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== '') params.append(key, v);
      });
    } else if (value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  return params.toString();
}

const ListingsWithFilters: FC<ListingsWithFiltersProps> = ({
  initialListings,
  initialPagination,
  initialFilters,
  categories,
}) => {
  const [filters, setFilters] = useState(initialFilters);

  // Build query string from filters
  const query = buildQueryString(filters);
  const { data, isValidating } = useSWR(
    `/api/listings?${query}`,
    fetcher,
    { fallbackData: { listings: initialListings, pagination: initialPagination } }
  );

  // Handler to update filters
  const handleFilterChange = (newFilters: Record<string, any>) => {
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
          {data.listings.map((l: Listing) => (
            <ListingCard
              key={l.id}
              id={l.id}
              title={l.title}
              price={l.price}
              listingCode={l.listingCode}
              status={mapListingStatus(l.status)}
              district={l.district}
              address={l.address}
              rooms={l.rooms}
              area={l.houseArea}
              floor={l.floor}
              totalFloors={l.totalFloors}
              condition={l.condition}
              imagePath={l.images && l.images[0] ? l.images[0].path : undefined}
              categoryName={l.category?.name}
              showCategory={true}
              dealType={l.dealType}
            />
          ))}
        </div>
        {/* Pagination, etc. */}
      </div>
    </div>
  );
};

export default ListingsWithFilters;