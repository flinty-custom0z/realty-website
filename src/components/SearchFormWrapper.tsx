'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery || '');
  
  // Update query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery === null) {
      setQuery('');
    } else if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams, query]);
  
  // Make sure we only pass a valid category slug
  const validatedSlug = categorySlug && categorySlug.trim() !== '' ? categorySlug : undefined;
  
  return (
    <Suspense fallback={<div className="w-full h-10 bg-gray-100 animate-pulse rounded"></div>}>
      <SearchForm categorySlug={validatedSlug} initialQuery={query} />
    </Suspense>
  );
}