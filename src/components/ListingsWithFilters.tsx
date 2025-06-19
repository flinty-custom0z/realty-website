'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import FilterSidebar from './FilterSidebar';
import ListingCard from './ListingCard';
import SortSelector from './SortSelector';
import { Category } from '@prisma/client';
import { FC } from 'react';
import { useDealType } from '@/contexts/DealTypeContext';

interface Listing {
  id: string;
  propertyType: {
    name: string;
  };
  price: number;
  listingCode: string;
  status: string;
  dealType: 'SALE' | 'RENT';
  category: {
    name: string;
    slug: string;
  };
  images: {
    path: string;
    isFeatured: boolean;
  }[];
  dateAdded: string;
  district: string;
  address: string;
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
  const { dealType } = useDealType();
  const [filters, setFilters] = useState(initialFilters);
  
  // Keep track of the last loaded pagination to prevent flickering
  const lastLoadedPaginationRef = useRef(initialPagination);

  // Update filters when dealType changes from context
  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      deal: dealType
    }));
  }, [dealType]);

  // Build query string from filters
  const query = buildQueryString(filters);
  const { data, isValidating } = useSWR(
    `/api/listings?${query}`,
    fetcher,
    { 
      fallbackData: { listings: initialListings, pagination: initialPagination },
      revalidateOnFocus: false
    }
  );

  // Update the ref when new data is loaded (not validating)
  useEffect(() => {
    if (!isValidating && data?.pagination) {
      lastLoadedPaginationRef.current = data.pagination;
    }
  }, [data?.pagination, isValidating]);

  // Use the last loaded pagination during loading states to prevent flickering
  const displayPagination = isValidating ? lastLoadedPaginationRef.current : data?.pagination;

  // Handler to update filters
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  // Handler for pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    // Scroll to top of listings section
    document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
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
            {data?.pagination && typeof data.pagination.total === 'number' && data.pagination.total > 0
              ? `Отображаются ${(data.pagination.page - 1) * data.pagination.limit + 1}‑${Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total,
                )} из ${data.pagination.total} результатов`
              : 'Нет результатов'}
          </p>
          <SortSelector filters={filters} onChange={handleFilterChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isValidating ? (
            // Loading state - display skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg h-80 animate-pulse"></div>
            ))
          ) : (
            data?.listings?.map((l: Listing) => (
              <ListingCard
                key={l.id}
                id={l.id}
                propertyType={l.propertyType}
                price={l.price}
                listingCode={l.listingCode}
                status={mapListingStatus(l.status)}
                district={l.district}
                address={l.address}
                area={l.houseArea}
                floor={l.floor}
                totalFloors={l.totalFloors}
                condition={l.condition}
                imagePaths={l.images
                  ?.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
                  .map(img => img.path) ?? []}
                categoryName={l.category?.name}
                category={l.category}
                showCategory={true}
                dealType={l.dealType}
              />
            )) || []
          )}
        </div>
        {(data?.listings && data.listings.length === 0) && !isValidating && (
          <div className="text-center py-8">
            <h3 className="text-xl font-medium mb-2">Объявления не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        )}
        
        {/* Pagination */}
        {displayPagination && displayPagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex flex-wrap justify-center space-x-2">
              {Array.from({ length: displayPagination.pages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-btn ${
                    pageNum === (filters.page || displayPagination.page)
                      ? 'pagination-btn-active'
                      : 'pagination-btn-inactive'
                  }`}
                  disabled={isValidating}
                >
                  {pageNum}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsWithFilters;