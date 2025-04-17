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
  
  return (
    <SearchParamsProvider>
      {(searchParams) => {
  // Update search query when URL changes
  useEffect(() => {
          if (!searchParams) return;
          
    const urlQuery = searchParams.get('q');
    if (urlQuery !== null) {
      setCurrentSearchQuery(urlQuery);
    } else if (currentSearchQuery && !urlQuery) {
      setCurrentSearchQuery('');
    }
  }, [searchParams, currentSearchQuery]);
  
  return (
    <Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse rounded"></div>}>
      <FilterSidebar 
        categorySlug={categorySlug}
        searchQuery={currentSearchQuery}
        categories={categories}
      />
    </Suspense>
        );
      }}
    </SearchParamsProvider>
  );
}