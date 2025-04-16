'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFormProps {
  categorySlug?: string;
  initialQuery?: string;
}

export default function SearchForm({ categorySlug, initialQuery = '' }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  
  // Update state from URL params after component mounts
  useEffect(() => {
    if (searchParams) {
      const queryParam = searchParams.get('q');
      if (queryParam) {
        setQuery(queryParam);
      }
    }
  }, [searchParams]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Build query params, preserving existing filters if any
    const params = new URLSearchParams();
    
    // Add the search query
    params.append('q', query);
    
    // Preserve other filter parameters if they exist
    if (searchParams) {
    const preserveParams = ['minPrice', 'maxPrice', 'rooms', 'district', 'condition', 'category'];
    preserveParams.forEach(param => {
        // Handle multiple values (like rooms)
        const values = searchParams.getAll(param);
        if (values.length > 0) {
          values.forEach(value => {
        params.append(param, value);
          });
      }
    });
    }
    
    // Always use the main search route when searching from navbar
    // Only use category-specific search when explicitly on a category page
    if (categorySlug && categorySlug.trim() !== '') {
      router.push(`/listing-category/${categorySlug}?${params.toString()}`);
    } else {
      router.push(`/search?${params.toString()}`);
    }
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition"
        >
          Искать
        </button>
      </div>
    </form>
  );
}