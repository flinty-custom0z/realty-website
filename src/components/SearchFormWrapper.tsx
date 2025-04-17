'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import SearchParamsProvider from '@/components/SearchParamsProvider';

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
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || '');
  
  return (
    <SearchParamsProvider>
      {(searchParams) => {
  // Update query when URL changes
  useEffect(() => {
          if (!searchParams) return;
          
    // Process URL query parameter
    const urlQuery = searchParams.get('q');
    
    // If we're on a category page, check if it matches the current category
    if (pathname.startsWith('/listing-category/')) {
      const currentCategorySlug = pathname.split('/')[2]?.split('?')[0];
      
      if (currentCategorySlug === categorySlug) {
        // Only update query if we're in the same category
        if (urlQuery !== null) {
          setQuery(urlQuery);
        }
      } else {
        // Clear query when category changes
      setQuery('');
      }
    } else if (urlQuery !== null) {
      // For other pages, just update to match URL
      setQuery(urlQuery);
    } else if (query && !urlQuery) {
      // Clear query when URL doesn't have one
      setQuery('');
    }
  }, [searchParams, pathname, categorySlug, query]);
  
  return (
    <Suspense fallback={<div className="w-full h-10 bg-gray-100 animate-pulse rounded"></div>}>
      <SearchForm categorySlug={categorySlug} initialQuery={query} />
    </Suspense>
        );
      }}
    </SearchParamsProvider>
  );
}