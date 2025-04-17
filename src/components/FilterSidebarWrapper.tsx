// src/components/FilterSidebarWrapper.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Determine if we're on a category page to track original category
  const originCategory = pathname.startsWith('/listing-category/') ? 
    pathname.split('/')[2].split('?')[0] : '';
  
  // If we have a search query, make sure it's passed to the FilterSidebar
  const effectiveSearchQuery = searchQuery || searchParams.get('q') || '';
  
  return (
    <Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse rounded"></div>}>
      <FilterSidebar 
        categorySlug={categorySlug}
        searchQuery={effectiveSearchQuery}
        categories={categories}
      />
    </Suspense>
  );
}