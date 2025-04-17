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
  
  // Sync with URL and clear on nav
  useEffect(() => {
    if (pathname.startsWith('/search') || pathname.startsWith('/listing-category/')) {
    const param = searchParams.get('q');
      if (param) {
        setQuery(param);
      }
    } else {
      // Clear search when navigating away from search or category pages
      setQuery('');
    }
  }, [searchParams, pathname]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Create new search params object
    const params = new URLSearchParams();
    params.append('q', query);
    
    // Preserve current filter values
    ['minPrice','maxPrice','district','condition','rooms'].forEach((p) => {
      searchParams.getAll(p).forEach((v) => params.append(p, v));
    });
    
    // Add 'from' parameter if we're on a category page
    if (categorySlug) {
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