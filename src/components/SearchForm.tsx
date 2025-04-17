'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SearchParamsProvider from '@/components/SearchParamsProvider';

interface SearchFormProps {
  categorySlug?: string;
  initialQuery?: string;
}

export default function SearchForm({ categorySlug, initialQuery = '' }: SearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  
  return (
    <SearchParamsProvider>
      {(searchParams) => {
  // Sync with URL and clear when appropriate
  useEffect(() => {
          if (!searchParams) return;
          
      const paramQuery = searchParams.get('q');
      
  if (pathname.startsWith('/search') || pathname.startsWith('/listing-category/')) {
    // Handle category pages
      if (pathname.startsWith('/listing-category/')) {
        const currentCategory = pathname.split('/')[2]?.split('?')[0];
        
        if (categorySlug === currentCategory && paramQuery) {
          setQuery(paramQuery);
        } else if (categorySlug !== currentCategory) {
          // Clear search when navigating to a different category
          setQuery('');
        }
      } else if (paramQuery) {
      // For search page
        setQuery(paramQuery);
      }
    } else if (pathname.startsWith('/listing/')) {
      // On listing detail page, preserve the query
      if (paramQuery) {
        setQuery(paramQuery);
      }
  } else if (pathname === '/') {
    // Explicitly clear search when on home page
    setQuery('');
    }
    // Don't clear the query when on detail pages
  }, [searchParams, pathname, categorySlug]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Create new search params object
    const params = new URLSearchParams();
    params.append('q', query);
    
    // Store the origin of the search to return to later
    if (pathname.startsWith('/listing-category/') && categorySlug) {
      // If coming from a category page, remember that
      params.append('from', `category:${categorySlug}`);
    } else if (!pathname.startsWith('/search')) {
            const currentFullUrl = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;
      params.append('returnUrl', encodeURIComponent(currentFullUrl));
    }
    
    // Determine where to search
    if (categorySlug) {
      // Search within the current category
      router.push(`/listing-category/${categorySlug}?${params}`);
    } else {
      // Global search
      router.push(`/search?${params}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={categorySlug ? `Поиск в категории` : "Поиск по всему сайту"}
          className="flex-grow p-2 border rounded-l"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition">
          Искать
        </button>
      </div>
    </form>
        );
      }}
    </SearchParamsProvider>
  );
}