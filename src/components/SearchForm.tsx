'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface SearchFormProps {
  categorySlug?: string;
  initialQuery?: string;
}

export default function SearchForm({ categorySlug, initialQuery = '' }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  
  // Sync with URL and clear when appropriate
  useEffect(() => {
    // Get current query from URL if on search or category page
    if (pathname.startsWith('/search') || pathname.startsWith('/listing-category/')) {
      const paramQuery = searchParams.get('q');
      
      // If we're on a category page, only set the query if it's for this category
      // This ensures search is cleared when switching categories
      if (pathname.startsWith('/listing-category/')) {
        const currentCategory = pathname.split('/')[2]?.split('?')[0];
        
        if (categorySlug === currentCategory && paramQuery) {
          setQuery(paramQuery);
        } else if (categorySlug !== currentCategory) {
          // Clear search when navigating to a different category
          setQuery('');
        }
      } else if (paramQuery) {
        // For search page, always set the query if it exists
        setQuery(paramQuery);
      }
    } else {
      // Clear search when navigating away from search or category pages
      setQuery('');
    }
  }, [searchParams, pathname, categorySlug]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Create new search params object
    const params = new URLSearchParams();
    params.append('q', query);
    
    // Store the full current URL (including all params) to return to later
    const currentFullUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    // Don't include the return URL if we're already on the search page
    if (!pathname.startsWith('/search')) {
      params.append('returnUrl', encodeURIComponent(currentFullUrl));
    }
    
    // Preserve current filter values if searching from a category page
    if (categorySlug) {
      ['minPrice','maxPrice','district','condition','rooms'].forEach((p) => {
        searchParams.getAll(p).forEach((v) => params.append(p, v));
      });
      params.append('from', `category:${categorySlug}`);
    }
    
    // Automatically use current category if in a category page or go to search page
    const base = categorySlug ? `/listing-category/${categorySlug}` : '/search';
    router.push(`${base}?${params}`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ваш запрос"
          className="flex-grow p-2 border rounded-l"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition">
          Искать
        </button>
      </div>
    </form>
  );
}