'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
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
  const previousPathRef = useRef(pathname);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  return (
    <SearchParamsProvider>
      {(searchParams) => {
  // Sync with URL and clear when appropriate
  useEffect(() => {
          if (!searchParams) return;
          
      const paramQuery = searchParams.get('q');
      
          // Detect navigation between pages
          if (previousPathRef.current !== pathname) {
            const prevPath = previousPathRef.current;
            previousPathRef.current = pathname;
            
            // Clear search when moving to home page
            if (pathname === '/') {
              setQuery('');
              setIsSearchActive(false);
              return;
            }
            
            // Clear search when navigating between categories
            if (pathname.startsWith('/listing-category/')) {
              const prevWasCategory = prevPath.startsWith('/listing-category/');
              
              if (prevWasCategory) {
                // Get category slugs
                const prevCategory = prevPath.split('/')[2]?.split('?')[0];
                const currentCategory = pathname.split('/')[2]?.split('?')[0];
                
                // If changing categories, clear search
                if (prevCategory !== currentCategory) {
                  setQuery('');
                  setIsSearchActive(false);
                  return;
                }
              } else {
                // Coming from a non-category page, clear search unless there's a query param
                if (!paramQuery) {
                setQuery('');
                  setIsSearchActive(false);
                return;
              }
            }
          }
          }
          
          // Update query to match URL parameter
          if (paramQuery !== null) {
        setQuery(paramQuery);
            setIsSearchActive(true);
          } else if (isSearchActive && !paramQuery) {
            // If search was active but now param is gone, clear it
    setQuery('');
            setIsSearchActive(false);
    }
  }, [searchParams, pathname, categorySlug]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
          
          setIsSearchActive(true);
    
    // Create new search params object
    const params = new URLSearchParams();
    params.append('q', query);
    
    // Store the origin of the search to return to later
    if (pathname.startsWith('/listing-category/') && categorySlug) {
            // If coming from a category page, mark this search with the from param
            params.append('from', 'global-search');
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
        
        const handleClearSearch = () => {
          setQuery('');
          setIsSearchActive(false);
          
          // If there's an active search, clear it by navigating
          if (searchParams?.has('q')) {
            // Remove query parameter but keep other parameters
            const newParams = new URLSearchParams();
            
            searchParams.forEach((value, key) => {
              if (key !== 'q') {
                newParams.append(key, value);
              }
            });
            
            // Determine base URL
            const base = categorySlug ? `/listing-category/${categorySlug}` : pathname;
            
            // Navigate with updated parameters
            router.push(`${base}${newParams.toString() ? `?${newParams.toString()}` : ''}`);
          }
        };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex">
              <div className="relative flex-grow">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={categorySlug ? `Поиск в категории` : "Поиск по всему сайту"}
                  className="w-full p-2 border rounded-l"
        />
                {query && (
                  <button 
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Очистить поиск"
                  >
                    ×
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition"
              >
          Искать
        </button>
      </div>
    </form>
        );
      }}
    </SearchParamsProvider>
  );
}