'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SearchParamsProvider from '@/components/SearchParamsProvider';

// Debounce utility
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

interface Suggestion {
  id: string;
  title: string;
  address?: string | null;
  listingCode?: string | null;
  districtName?: string | null;
  propertyTypeName?: string | null;
}

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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const isClickingRef = useRef(false);
  
  // Clear suggestions when pathname changes (user navigates to different page)
  useEffect(() => {
    setSuggestions([]);
    setShowSuggestions(false);
  }, [pathname]);
  
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
    if (!previousPathRef.current && pathname && !pathname.startsWith('/search')) {
            previousPathRef.current = pathname;
          }
          
          setIsSearchActive(true);
    
    // Create new search params object
    const params = new URLSearchParams();
    params.append('q', query);
    
    // Store the origin of the search to return to later
    if (pathname && pathname.startsWith('/listing-category/') && categorySlug) {
            // If coming from a category page, mark this search with the from param
            params.append('from', 'global-search');
    } else if (pathname && !pathname.startsWith('/search')) {
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
          if (pathname && pathname.startsWith('/listing-category/')) {
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
          router.push(`${pathname || ''}${newParams.toString() ? `?${newParams.toString()}` : ''}`);
        };
  
  // Fetch suggestions (debounced)
  const fetchSuggestions = debounce(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/listings/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const newSuggestions = data.suggestions || [];
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } catch (e) {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, 250);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    fetchSuggestions(e.target.value);
    setHighlightedIndex(-1);
  };

  // Navigate directly to the listing details page when a suggestion is clicked
  const handleSuggestionClick = (suggestion: Suggestion, event?: React.MouseEvent) => {
    // Prevent any form submission or default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Set flag to prevent blur timeout
    isClickingRef.current = true;
    
    // Immediately hide suggestions and clear state to prevent flickering
    setShowSuggestions(false);
    setSuggestions([]);
    setQuery('');
    setIsSearchActive(false);

    // Navigate to the listing details page
    router.push(`/listing/${suggestion.id}`);
  };
  
  // Handle keyboard navigation
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSuggestionClick(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Hide suggestions on blur (with delay to allow click)
  const handleInputBlur = () => {
    setTimeout(() => {
      // Don't hide suggestions if we're in the middle of clicking
      if (!isClickingRef.current) {
        setShowSuggestions(false);
      }
      // Reset the flag
      isClickingRef.current = false;
    }, 150);
  };

  // Submit handler (internal, can be called from suggestion click)
  const handleSubmitInternal = (searchValue: string) => {
    if (!searchValue.trim()) return;
    const params = new URLSearchParams();
    params.append('q', searchValue);
    if (pathname && pathname.startsWith('/listing-category/') && categorySlug) {
      params.append('from', 'global-search');
    } else if (pathname && !pathname.startsWith('/search')) {
      params.append('returnUrl', encodeURIComponent(pathname));
    }
    if (categorySlug) {
      router.push(`/listing-category/${categorySlug}?${params}`);
    } else {
      router.push(`/search?${params}`);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmitInternal(query); }} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onFocus={() => { 
            // Clear old suggestions when focusing
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }}
          placeholder={categorySlug ? `Поиск в категории` : "Поиск по всему сайту"}
          className="w-full py-3 pl-11 pr-14 rounded-full bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-colors"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions-list"
          aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-14 flex items-center pr-2 text-gray-400 hover:text-gray-600"
            aria-label="Очистить поиск"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-700 hover:text-gray-900 font-medium"
        >
          Найти
        </button>
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
        <div className="relative mt-1 z-10">
          <ul
            ref={suggestionsRef}
            id="search-suggestions-list"
            className="absolute w-full bg-white border border-gray-100 rounded-lg shadow-lg py-1 max-h-60 overflow-auto z-20"
            role="listbox"
          >
            {isLoadingSuggestions && (
              <li className="px-4 py-2 text-gray-400">Загрузка...</li>
            )}
            {suggestions.map((s, idx) => (
              <li
                key={s.id}
                id={`suggestion-${idx}`}
                role="option"
                aria-selected={highlightedIndex === idx}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                  highlightedIndex === idx ? 'bg-gray-50' : ''
                }`}
                onMouseDown={(e) => handleSuggestionClick(s, e)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <div className="font-medium text-gray-800">{s.title}</div>
                <div className="text-xs text-gray-500 space-y-1">
                  {s.address && (
                    <div className="truncate">📍 {s.address}</div>
                  )}
                  {s.districtName && (
                    <div className="truncate">🏘️ {s.districtName}</div>
                  )}
                  {s.listingCode && (
                    <div className="truncate">🏷️ {s.listingCode}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
      }}
    </SearchParamsProvider>
  );
}