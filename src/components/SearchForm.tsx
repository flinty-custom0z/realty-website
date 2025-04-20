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
  
  // Fetch suggestions (debounced)
  const fetchSuggestions = debounce(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/listings/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
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

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsSearchActive(true);
    // Submit search
    handleSubmitInternal(suggestion.title);
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
    setTimeout(() => setShowSuggestions(false), 100);
  };

  // Submit handler (internal, can be called from suggestion click)
  const handleSubmitInternal = (searchValue: string) => {
    if (!searchValue.trim()) return;
    // ... existing code ...
    const params = new URLSearchParams();
    params.append('q', searchValue);
    if (pathname.startsWith('/listing-category/') && categorySlug) {
      params.append('from', 'global-search');
    } else if (!pathname.startsWith('/search')) {
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
      <div className="flex">
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            placeholder={categorySlug ? `Поиск в категории` : "Поиск по всему сайту"}
            className="w-full p-2 border rounded-l"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-suggestions-list"
            aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
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
          {/* Suggestions dropdown */}
          {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
            <ul
              ref={suggestionsRef}
              id="search-suggestions-list"
              className="absolute z-10 left-0 right-0 bg-white border border-t-0 rounded-b shadow-lg max-h-60 overflow-y-auto mt-1"
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
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${highlightedIndex === idx ? 'bg-blue-100' : ''}`}
                  onMouseDown={() => handleSuggestionClick(s)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {s.title}
                </li>
              ))}
            </ul>
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