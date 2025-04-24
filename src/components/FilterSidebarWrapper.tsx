// src/components/FilterSidebarWrapper.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import SearchParamsProvider from '@/components/SearchParamsProvider';

const FilterSidebar = dynamic(() => import('@/components/FilterSidebar'), {
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded"></div>
});

interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  available?: boolean;
}

interface FilterSidebarWrapperProps {
  categorySlug: string;
  searchQuery?: string;
  categories?: Category[];
}

export default function FilterSidebarWrapper({ 
  categorySlug,
  searchQuery,
  categories 
}: FilterSidebarWrapperProps) {
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery || '');
  const pathname = usePathname();
  
  // Determine if we are on a category page
  const isCategoryPage = pathname.startsWith('/listing-category/');

  return (
    <SearchParamsProvider>
      {(searchParams) => {
        // Update search query when URL changes
        useEffect(() => {
          if (!searchParams) return;
          
          if (isCategoryPage) {
            // For category pages, use categoryQuery parameter
            const categoryQueryParam = searchParams.get('categoryQuery');
            if (categoryQueryParam !== null) {
              setCurrentSearchQuery(categoryQueryParam);
            } else if (currentSearchQuery && !categoryQueryParam) {
              setCurrentSearchQuery('');
            }
          } else {
            // For global search, use q parameter
            const urlQuery = searchParams.get('q');
            if (urlQuery !== null) {
              setCurrentSearchQuery(urlQuery);
            } else if (currentSearchQuery && !urlQuery) {
              setCurrentSearchQuery('');
            }
          }
        }, [searchParams, currentSearchQuery, isCategoryPage]);

        // Extract any existing filter values from URL
        const initialFilters: Record<string, any> = {};
        
        // Add deal type if present in URL, without default
        const dealType = searchParams?.get('dealType');
        if (dealType) {
          initialFilters.dealType = dealType;
        }

        return (
          <Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse rounded"></div>}>
            <FilterSidebar 
              categorySlug={categorySlug}
              searchQuery={currentSearchQuery}
              categories={categories}
              filters={initialFilters}
            />
          </Suspense>
        );
      }}
    </SearchParamsProvider>
  );
}