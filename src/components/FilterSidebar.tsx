'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
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
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.getAll('category'));
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(searchParams.getAll('district'));
  const [selectedConditions, setSelectedConditions] = useState<string[]>(searchParams.getAll('condition'));
  const [selectedRooms, setSelectedRooms] = useState<string[]>(searchParams.getAll('rooms'));

  // Reference to initial filter options
  const initialOptionsRef = useRef<FilterOptions>({
    districts: [],
    conditions: [],
    rooms: [],
    priceRange: { min: 0, max: 30000000 }
  });

  // State for current filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    districts: [],
    conditions: [],
    rooms: [],
    priceRange: { min: 0, max: 30000000 }
  });

  // Flag to prevent multiple calls
  const isApplyingRef = useRef(false);
  
  // Fetch available filter options dynamically
  useEffect(() => {
    // Create an abort controller for cleanup
    const controller = new AbortController();
    
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
      
      try {
      const res = await fetch(url, { signal: controller.signal });
      
      if (res.ok) {
        const data = await res.json();
        setFilterOptions(data);
          
          // Save initial filter options when first loaded
          if (initialOptionsRef.current.districts.length === 0) {
            initialOptionsRef.current = data;
          }
        
        // Update price range if not explicitly set by user
        if (!searchParams.has('minPrice')) {
          setMinPrice(data.priceRange.min.toString());
        }
        if (!searchParams.has('maxPrice')) {
          setMaxPrice(data.priceRange.max.toString());
        }
        }
      } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error fetching filter options:", error);
      }
    }
    };
    
    fetchFilterOptions();
    
      // Clean up by aborting any in-flight requests when the component unmounts or deps change
  return () => {
    controller.abort();
  };
}, [categorySlug, searchQuery, searchParams]);
  
  // Additional useEffect to sync with URL changes
  useEffect(() => {
    // When searchParams changes, check if 'q' parameter exists
    const urlQuery = searchParams.get('q');
    if (urlQuery === null && query !== '') {
      // If 'q' param was removed from URL but our state still has it, clear it
      setQuery('');
    }
  }, [searchParams, query]);

  // Determine if custom filters are applied
  const hasCustomFilters = () => {
    // Check if there's a search query
    const hasSearchQuery = query.trim() !== '';
    
    // Check if price is different from initial
    const hasCustomPrice = 
      (minPrice !== '' && minPrice !== initialOptionsRef.current.priceRange.min.toString()) || 
      (maxPrice !== '' && maxPrice !== initialOptionsRef.current.priceRange.max.toString());
    
    // Check if any other filters are selected
    const hasOtherFilters = 
      selectedDistricts.length > 0 || 
      selectedConditions.length > 0 || 
      selectedRooms.length > 0 ||
      (!categorySlug && selectedCategories.length > 0);
    
    return hasSearchQuery || hasCustomPrice || hasOtherFilters;
  };

  // Apply filters
  const applyFilters = () => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;
    
    try {
    const params = new URLSearchParams();
    
    // Preserve search query if exists
    if (query.trim()) params.append('q', query);
    
      // Add price filters only if they differ from defaults
      const minDefault = initialOptionsRef.current.priceRange.min.toString();
      const maxDefault = initialOptionsRef.current.priceRange.max.toString();
      
      if (minPrice && minPrice !== minDefault) {
        params.append('minPrice', minPrice);
      }
      
      if (maxPrice && maxPrice !== maxDefault) {
        params.append('maxPrice', maxPrice);
      }
    
    // Add multi-select filters
    selectedCategories.forEach((c) => params.append('category', c));
    selectedDistricts.forEach((d) => params.append('district', d));
    selectedConditions.forEach((c) => params.append('condition', c));
    selectedRooms.forEach((r) => params.append('rooms', r));

      // Keep return URL if it exists
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        params.append('returnUrl', returnUrl);
      }

      // Keep the 'from' parameter if it exists
    const fromParam = searchParams.get('from');
    if (fromParam) {
      params.append('from', fromParam);
    }

    // Determine the base URL (category page or search page)
    const base = categorySlug ? `/listing-category/${categorySlug}` : '/search';
    router.push(`${base}?${params.toString()}`);
    } finally {
      // Reset flag after a delay to prevent multiple rapid calls
      setTimeout(() => {
        isApplyingRef.current = false;
      }, 300);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    // Reset to initial values
    setQuery('');
    setMinPrice(initialOptionsRef.current.priceRange.min.toString());
    setMaxPrice(initialOptionsRef.current.priceRange.max.toString());
    setSelectedCategories([]);
    setSelectedDistricts([]);
    setSelectedConditions([]);
    setSelectedRooms([]);
    
    // Keep return URL and from parameter
    const params = new URLSearchParams();
    
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      params.append('returnUrl', returnUrl);
    }
    
    const fromParam = searchParams.get('from');
    if (fromParam) {
      params.append('from', fromParam);
    }
    
    // Navigate to the base URL with minimal params
    const base = categorySlug ? `/listing-category/${categorySlug}` : '/search';
    router.push(`${base}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Handler functions for filter changes
  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) => {
      return prev.includes(slug) 
        ? prev.filter((s) => s !== slug) 
        : [...prev, slug];
    });
  };
  
  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts((prev) => {
      return prev.includes(district) 
        ? prev.filter((d) => d !== district) 
        : [...prev, district];
    });
  };
  
  const handleConditionToggle = (cond: string) => {
    setSelectedConditions((prev) => {
      return prev.includes(cond) 
        ? prev.filter((c) => c !== cond) 
        : [...prev, cond];
    });
  };
  
  const handleRoomToggle = (room: string) => {
    setSelectedRooms((prev) => {
      return prev.includes(room)
        ? prev.filter((r) => r !== room)
        : [...prev, room];
    });
  };
  
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Category-specific search
  const handleCategorySearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Use the regular filter apply mechanism but ensure the query is set
    applyFilters();
  };
  
  return (
    <div className="p-4 bg-white shadow rounded-md mb-6">
      {/* Category-specific search field - only show in category pages */}
      {categorySlug && (
        <form onSubmit={handleCategorySearch} className="mb-4">
          <label className="block text-sm font-medium mb-1">Поиск по категории</label>
          <div className="flex">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск"
              className="w-full p-2 border rounded-l"
            />
            <button type="submit" className="bg-blue-500 text-white px-3 rounded-r hover:bg-blue-600 transition">
              Искать
            </button>
          </div>
        </form>
        )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Multi-category selection (only on general search page) */}
        {!categorySlug && categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Категории</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
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
    
        {/* Filter action buttons */}
        <div className={hasCustomFilters() ? "flex space-x-2" : ""}>
        <button
          type="submit"
            className={hasCustomFilters() ? "flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition" : "w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"}
        >
          Применить фильтры
        </button>
          
          {/* Only show reset button when custom filters are applied */}
          {hasCustomFilters() && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
          >
            Сбросить фильтры
          </button>
          )}
        </div>
      </form>
    </div>
  );
}