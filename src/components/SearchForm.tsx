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
  const previousPathRef = useRef<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  return (
    <SearchParamsProvider>
      {(searchParams) => {
        // Sync with URL and track previous path
  useEffect(() => {
          if (!searchParams) return;
          
      const paramQuery = searchParams.get('q');
          const fromParam = searchParams.get('from');
          const returnUrlParam = searchParams.get('returnUrl');
          
          // Store return destination
          if ((fromParam || returnUrlParam) && !previousPathRef.current) {
            if (returnUrlParam) {
              try {
                previousPathRef.current = decodeURIComponent(returnUrlParam);
              } catch (e) {
                console.error("Failed to decode returnUrl", e);
            }
            } else if (fromParam?.startsWith('category:')) {
              const categorySlug = fromParam.split(':')[1];
              if (categorySlug) {
                previousPathRef.current = `/listing-category/${categorySlug}`;
              }
            }
          }
          
          // If we're on search results page and no return path is set, 
          // set it to home or appropriate category
          if (pathname === '/search' && !previousPathRef.current) {
            // Check if a category is selected
            const categoryParam = searchParams.get('category');
            if (categoryParam) {
              previousPathRef.current = `/listing-category/${categoryParam}`;
            } else {
              previousPathRef.current = '/';
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
        }, [searchParams, pathname]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
          
          // Store current path before navigating to search results
          if (!previousPathRef.current && !pathname.startsWith('/search')) {
            previousPathRef.current = pathname;
          }
          
          setIsSearchActive(true);
    
    // Create new search params object
    const params = new URLSearchParams();
    params.append('q', query);
    
    // Store the origin of the search to return to later
    if (pathname.startsWith('/listing-category/') && categorySlug) {
            // If coming from a category page, mark this search with the from param
            params.append('from', 'global-search');
    } else if (!pathname.startsWith('/search')) {
            params.append('returnUrl', encodeURIComponent(pathname));
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
          
          // Navigate back to previous page if we're on search results
          if (pathname === '/search' && previousPathRef.current) {
            router.push(previousPathRef.current);
            return;
          }
          
          // If in a category, just clear the search parameter
          if (pathname.startsWith('/listing-category/')) {
            router.push(pathname);
            return;
          }
          
          // Default: stay on current page but remove search parameter
            const newParams = new URLSearchParams();
            
          searchParams?.forEach((value, key) => {
              if (key !== 'q') {
                newParams.append(key, value);
              }
            });
            
            // Navigate with updated parameters
          router.push(`${pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`);
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