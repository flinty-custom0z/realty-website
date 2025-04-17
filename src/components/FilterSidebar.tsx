'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterOptions {
  districts: string[];
  conditions: string[];
  rooms: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

interface FilterSidebarProps {
  categorySlug: string;
  categories?: Category[];
  searchQuery?: string;
}

export default function FilterSidebar({
  categorySlug,
  categories = [],
  searchQuery = '',
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // State for filters
  const [query, setQuery] = useState(searchQuery);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '0');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '30000000');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.getAll('category'));
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(searchParams.getAll('district'));
  const [selectedConditions, setSelectedConditions] = useState<string[]>(searchParams.getAll('condition'));
  const [selectedRooms, setSelectedRooms] = useState<string[]>(searchParams.getAll('rooms'));

  // State for available options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    districts: [],
    conditions: [],
    rooms: [],
    priceRange: { min: 0, max: 30000000 }
  });
  
  // Fetch available filter options dynamically
  useEffect(() => {
    const fetchFilterOptions = async () => {
      // Include search query in the filter options URL
      let url = `/api/filter-options`;
      const params = new URLSearchParams();
      
      if (categorySlug) {
        params.append('category', categorySlug);
      }
      
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFilterOptions(data);
        
        // Update price range if not explicitly set by user
        if (!searchParams.has('minPrice')) {
          setMinPrice(data.priceRange.min.toString());
        }
        if (!searchParams.has('maxPrice')) {
          setMaxPrice(data.priceRange.max.toString());
        }
      }
    };
    fetchFilterOptions();
  }, [categorySlug, searchQuery, searchParams]);
  
  // Clear query on nav
  useEffect(() => {
    if (!pathname.startsWith('/search') && !pathname.startsWith('/listing-category/')) {
      setQuery('');
    }
  }, [pathname]);

  // Apply filters automatically when changed
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    // Preserve search query if exists
    if (query.trim()) params.append('q', query);
    
    // Add all other filters
    params.append('minPrice', minPrice);
    params.append('maxPrice', maxPrice);
    
    // Add multi-select filters
    selectedCategories.forEach((c) => params.append('category', c));
    selectedDistricts.forEach((d) => params.append('district', d));
    selectedConditions.forEach((c) => params.append('condition', c));
    selectedRooms.forEach((r) => params.append('rooms', r));

    // Determine the base URL (category page or search page)
    const base = categorySlug ? `/listing-category/${categorySlug}` : '/search';
    router.push(`${base}?${params.toString()}`);
  };

  // Handler functions for filter changes with auto-apply
  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(slug) 
        ? prev.filter((s) => s !== slug) 
        : [...prev, slug];
      
      setTimeout(() => applyFilters(), 0);
      return newCategories;
    });
  };
  
  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts((prev) => {
      const newDistricts = prev.includes(district) 
        ? prev.filter((d) => d !== district) 
        : [...prev, district];
      
      setTimeout(() => applyFilters(), 0);
      return newDistricts;
    });
  };
  
  const handleConditionToggle = (cond: string) => {
    setSelectedConditions((prev) => {
      const newConditions = prev.includes(cond) 
        ? prev.filter((c) => c !== cond) 
        : [...prev, cond];
      
      setTimeout(() => applyFilters(), 0);
      return newConditions;
    });
  };
  
  const handleRoomToggle = (room: string) => {
    setSelectedRooms((prev) => {
      const newRooms = prev.includes(room)
        ? prev.filter((r) => r !== room)
        : [...prev, room];
      
      setTimeout(() => applyFilters(), 0);
      return newRooms;
    });
  };
  
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
    // Don't auto-apply price filter immediately to avoid too many requests while typing
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Get current base path to determine if we're on search or category page
  const isSearchPage = pathname.startsWith('/search');
  // Get the original category if coming from a category page
  const originatingCategory = searchParams.get('from')?.startsWith('category:') 
    ? searchParams.get('from')?.split(':')[1] 
    : null;
  
  return (
    <div className="p-4 bg-white shadow rounded-md mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Only show search field if we're not in a category page */}
        {!categorySlug && (
          <div>
            <label className="block text-sm font-medium mb-1">Поиск</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ваш запрос"
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        {/* "Return to" link when on search results page */}
        {searchQuery && isSearchPage && (
          <div className="mb-4">
            {originatingCategory ? (
              <Link 
                href={`/listing-category/${originatingCategory}`} 
                className="text-blue-500 hover:text-blue-700 inline-flex items-center"
              >
                <span className="mr-1">←</span> Назад к категории
              </Link>
            ) : (
              <Link href="/" className="text-blue-500 hover:text-blue-700 inline-flex items-center">
                <span className="mr-1">←</span> На главную
            </Link>
            )}
          </div>
        )}

        {/* Multi-category selection (only on general search page) */}
        {!categorySlug && (
          <div>
            <label className="block text-sm font-medium mb-1">Категории</label>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.slug)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    selectedCategories.includes(cat.slug)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
    
        {/* Price Range */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Мин. цена</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              min={filterOptions.priceRange.min}
              max={filterOptions.priceRange.max}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Макс. цена</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              min={filterOptions.priceRange.min}
              max={filterOptions.priceRange.max}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
    
        {/* Available Districts - dynamically fetched */}
        {filterOptions.districts.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Районы</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
            {filterOptions.districts.map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => handleDistrictToggle(dist)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedDistricts.includes(dist)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>
        )}
    
        {/* Available Conditions - dynamically fetched */}
        {filterOptions.conditions.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Состояние</label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.conditions.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => handleConditionToggle(cond)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedConditions.includes(cond)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Available Room Options - dynamically fetched */}
        {filterOptions.rooms.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Комнаты</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.rooms.map((room) => (
                <button
                  key={room}
                  type="button"
                  onClick={() => handleRoomToggle(room)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedRooms.includes(room)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>
        )}
    
        {/* Apply Filters Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Применить фильтры
        </button>
      </form>
    </div>
  );
}