// src/components/FilterSidebarWrapper.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, usePathname } from 'next/navigation';

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
  // Client side state to store search parameters
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery || '');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Update search query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery !== null) {
      setCurrentSearchQuery(urlQuery);
    } else if (currentSearchQuery && !urlQuery) {
      // Clear search when 'q' param is removed
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
}