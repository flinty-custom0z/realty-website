// src/components/SearchFormWrapper.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SearchForm = dynamic(() => import('@/components/SearchForm'), {
  loading: () => <div className="w-full h-10 bg-gray-100 animate-pulse rounded"></div>
});

interface SearchFormWrapperProps {
  categorySlug?: string;
  initialQuery?: string;
}

export default function SearchFormWrapper({ 
  categorySlug, 
  initialQuery 
}: SearchFormWrapperProps) {
  // Make sure we only pass a valid category slug
  const validatedSlug = categorySlug && categorySlug.trim() !== '' ? categorySlug : undefined;
  
  return (
    <Suspense fallback={<div className="w-full h-10 bg-gray-100 animate-pulse rounded"></div>}>
      <SearchForm categorySlug={validatedSlug} initialQuery={initialQuery} />
    </Suspense>
  );
}