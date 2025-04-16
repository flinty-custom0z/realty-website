// src/components/FilterSidebarWrapper.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

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
  return (
    <Suspense fallback={<div className="w-full h-96 bg-gray-100 animate-pulse rounded"></div>}>
      <FilterSidebar 
        categorySlug={categorySlug}
        searchQuery={searchQuery}
        categories={categories}
      />
    </Suspense>
  );
}