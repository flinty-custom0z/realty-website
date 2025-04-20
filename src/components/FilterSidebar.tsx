'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  available?: boolean;
}

interface FilterOption {
  value: string;
  count: number;
  available: boolean;
}

interface FilterOptions {
  districts: FilterOption[];
  conditions: FilterOption[];
  rooms: FilterOption[];
  categories: Category[];
  priceRange: {
    min: number;
    max: number;
  };
  totalCount: number;
  hasFiltersApplied: boolean;
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
  
  // State for search input (for category-specific search)
  const [searchInputValue, setSearchInputValue] = useState(searchQuery || '');
  
  // States for filter values
  const [minPrice, setMinPrice] = useState<string>(searchParams?.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams?.get('maxPrice') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams?.getAll('category') || []);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(searchParams?.getAll('district') || []);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(searchParams?.getAll('condition') || []);
  const [selectedRooms, setSelectedRooms] = useState<string[]>(searchParams?.getAll('rooms') || []);
  
  // State to track loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Simplified tracking of user edit intentions
  const [userEditedPrice, setUserEditedPrice] = useState({
    min: false,
    max: false
  });
  
  // Flag to immediately force price update when filters change
  const shouldUpdatePrices = useRef(false);
  
  // State for current filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    districts: [],
    conditions: [],
    rooms: [],
    categories: [],
    priceRange: { min: 0, max: 30000000 },
    totalCount: 0,
    hasFiltersApplied: false
  });

  // Flags to control behavior
  const isApplyingRef = useRef(false);
  const filterChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestCounter = useRef(0);
  
  // Helper to determine if price filter should be applied
  const shouldApplyPriceFilter = () => {
    // Only apply if user has entered a value different from the default
    return (
      (minPrice && filterOptions.priceRange.min !== undefined && minPrice !== filterOptions.priceRange.min.toString()) ||
      (maxPrice && filterOptions.priceRange.max !== undefined && maxPrice !== filterOptions.priceRange.max.toString())
    );
  };
  
  // Sync with URL parameters
  useEffect(() => {
    if (!searchParams) return;
    
    const paramQuery = categorySlug ? searchParams.get('categoryQuery') : searchParams.get('q');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    
    if (paramQuery !== null) {
      setSearchInputValue(paramQuery);
    }
    
    // Update prices from URL if they exist and we're loading for the first time
    if (minPriceParam !== null && isInitialLoadRef.current) {
        setMinPrice(minPriceParam);
      }
    
    if (maxPriceParam !== null && isInitialLoadRef.current) {
        setMaxPrice(maxPriceParam);
      }
    
    // Update selected filters from URL
    setSelectedCategories(searchParams.getAll('category'));
    setSelectedDistricts(searchParams.getAll('district'));
    setSelectedConditions(searchParams.getAll('condition'));
    setSelectedRooms(searchParams.getAll('rooms'));
    
    // After first load, mark as no longer initial
    if (isInitialLoadRef.current) {
    isInitialLoadRef.current = false;
    }
  }, [searchParams]);
  
  // Fetch filter options immediately when any filter selection changes
  useEffect(() => {
    // This runs for every filter change
    if (!isInitialLoadRef.current) {
      shouldUpdatePrices.current = true;
    
      // Clear any existing timeout
      if (filterChangeTimeoutRef.current) {
        clearTimeout(filterChangeTimeoutRef.current);
      }
      
      // Use a smaller timeout for filter changes to make it feel more responsive
      filterChangeTimeoutRef.current = setTimeout(() => {
        fetchFilterOptions();
      }, 100);
    }
  }, [selectedDistricts, selectedConditions, selectedRooms, selectedCategories]);
  
  // Fetch filter options for other changes (search, price, initial load)
   useEffect(() => {
    // Skip if this is just a filter selection (handled by the other effect)
    if (shouldUpdatePrices.current) return;
    
    // Clear any existing timeout
    if (filterChangeTimeoutRef.current) {
      clearTimeout(filterChangeTimeoutRef.current);
    }
    
    // Standard debounce timeout
      filterChangeTimeoutRef.current = setTimeout(() => {
      fetchFilterOptions();
    }, 300);
    
    return () => {
      if (filterChangeTimeoutRef.current) {
        clearTimeout(filterChangeTimeoutRef.current);
      }
    };
  }, [
    categorySlug,
    searchInputValue,
    minPrice,
    maxPrice
  ]);
  
  // Fetch filtered options based on current selections
  const fetchFilterOptions = async () => {
    setIsLoading(true);

    // Cancel previous fetch if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    requestCounter.current += 1;
    const currentRequest = requestCounter.current;

    // Build query params with all current active filters
    const params = new URLSearchParams();

    // Base filters
    if (categorySlug) {
      params.append('category', categorySlug);
    }

    if (searchInputValue.trim()) {
      // Use categoryQuery for category pages, q for global search
      if (categorySlug) {
        params.append('categoryQuery', searchInputValue);
      } else {
        params.append('q', searchInputValue);
      }
    }

    // Add all selected filters
    selectedCategories.forEach(c => params.append('category', c));
    selectedDistricts.forEach(d => params.append('district', d));
    selectedConditions.forEach(c => params.append('condition', c));
    selectedRooms.forEach(r => params.append('rooms', r));

    // Add current price if provided
    if (minPrice) {
      params.append('minPrice', minPrice);
    }
    if (maxPrice) {
      params.append('maxPrice', maxPrice);
    }

    // Only send applyPriceFilter if price is actually set and different from default
    if (shouldApplyPriceFilter()) {
      params.append('applyPriceFilter', 'true');
    }

    try {
      const res = await fetch(`/api/filter-options?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) return;
      const data = await res.json();
      // Only update state if this is the latest request
      if (currentRequest === requestCounter.current) {
        setFilterOptions(data);
        // Update price ranges based on available data
        const newMinPrice = data.priceRange.min;
        const newMaxPrice = data.priceRange.max;
        if (shouldUpdatePrices.current || isInitialLoadRef.current) {
          if (newMinPrice !== undefined && !userEditedPrice.min) {
            setMinPrice(newMinPrice.toString());
          }
          if (newMaxPrice !== undefined && !userEditedPrice.max) {
            setMaxPrice(newMaxPrice.toString());
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Error fetching filter options:', error);
    } finally {
      if (currentRequest === requestCounter.current) {
        setIsLoading(false);
        shouldUpdatePrices.current = false;
      }
    }
  };
    
  // Determine if custom filters are applied
  const hasCustomFilters = () => {
    // For category pages, search query is a filter
    const hasSearchQuery = categorySlug && searchInputValue.trim() !== '';
    
  // For global search, if there's a query, it's considered the base state, not a filter
  const globalSearchQuery = searchParams?.get('q') || '';
    
  // Custom price filters - check if they differ from the base price range
    const hasCustomPrice = 
    (minPrice !== '' && 
     filterOptions.priceRange.min !== undefined && 
       parseInt(minPrice) !== filterOptions.priceRange.min) || 
    (maxPrice !== '' && 
     filterOptions.priceRange.max !== undefined && 
       parseInt(maxPrice) !== filterOptions.priceRange.max);
    
    // Other filters
    const hasOtherFilters = 
    selectedDistricts.length > 0 || 
    selectedConditions.length > 0 || 
    selectedRooms.length > 0 ||
    (!categorySlug && selectedCategories.length > 0);
    
    return hasSearchQuery || hasCustomPrice || hasOtherFilters;
  };
  
  // Apply filters when form is submitted
  const applyFilters = () => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;
    
    try {
      // When user explicitly clicks Apply, respect their price entries
      if (minPrice) setUserEditedPrice(prev => ({ ...prev, min: true }));
      if (maxPrice) setUserEditedPrice(prev => ({ ...prev, max: true }));
      
      const params = new URLSearchParams();
      
      // Add search query
      if (categorySlug) {
        // In category, use ONLY the local search input with a DIFFERENT parameter name
        if (searchInputValue.trim()) {
          params.append('categoryQuery', searchInputValue);
        }
      } else {
        // In global search, preserve the query parameter
        const currentQuery = searchParams?.get('q');
        if (currentQuery) {
          params.append('q', currentQuery);
        }
      }
      
      // Add price filters - only if they have values
      if (minPrice) {
        params.append('minPrice', minPrice);
      }
      
      if (maxPrice) {
        params.append('maxPrice', maxPrice);
      }
      
      // Add multi-select filters
      if (selectedCategories.length > 0) {
        selectedCategories.forEach((c) => params.append('category', c));
      }
      
      selectedDistricts.forEach((d) => params.append('district', d));
      selectedConditions.forEach((c) => params.append('condition', c));
      selectedRooms.forEach((r) => params.append('rooms', r));
      
      // Preserve navigation parameters
      const returnUrl = searchParams?.get('returnUrl');
      if (returnUrl) {
        params.append('returnUrl', returnUrl);
      }
      
      const fromParam = searchParams?.get('from');
      if (fromParam) {
        params.append('from', fromParam);
      }
      
      // Navigate to appropriate page
      const base = categorySlug ? `/listing-category/${categorySlug}` : '/search';
      router.push(`${base}?${params.toString()}`);
    } finally {
      setTimeout(() => {
        isApplyingRef.current = false;
      }, 200);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    // Reset to initial values
    if (filterOptions.priceRange.min !== undefined) {
      setMinPrice(filterOptions.priceRange.min.toString());
    }
    if (filterOptions.priceRange.max !== undefined) {
      setMaxPrice(filterOptions.priceRange.max.toString());
    }
    
    setSelectedCategories([]);
    setSelectedDistricts([]);
    setSelectedConditions([]);
    setSelectedRooms([]);
    
    // Clear local search input in category pages
    if (categorySlug) {
      setSearchInputValue('');
    }
    
    // Reset user edit flags
    setUserEditedPrice({ min: false, max: false });
    
    // Create params preserving only global search if appropriate
    const params = new URLSearchParams();
    
    // Always preserve global search query (q), not local category search (categoryQuery)
    const currentQuery = searchParams?.get('q');
    if (currentQuery && pathname === '/search') {
        params.append('q', currentQuery);
    }
    
    // Keep navigation parameters
    const returnUrl = searchParams?.get('returnUrl');
    if (returnUrl) {
      params.append('returnUrl', returnUrl);
    }
    
    const fromParam = searchParams?.get('from');
    if (fromParam) {
      params.append('from', fromParam);
    }
    
    // Navigate with reset filters
    const base = categorySlug ? `/listing-category/${categorySlug}` : '/search';
    router.push(`${base}${params.toString() ? `?${params.toString()}` : ''}`);
  };
  
  // Handler functions for filter changes (use functional updates)
  const handleCategoryToggle = (slug: string) => {
    shouldUpdatePrices.current = true;
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };
  
  const handleDistrictToggle = (district: string) => {
    shouldUpdatePrices.current = true;
    setSelectedDistricts(prev =>
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };
  
  const handleConditionToggle = (cond: string) => {
    shouldUpdatePrices.current = true;
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };
  
  const handleRoomToggle = (room: string) => {
    shouldUpdatePrices.current = true;
    setSelectedRooms(prev =>
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
    );
  };
  
  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value);
      // Mark as user edited to prevent automatic updates
      setUserEditedPrice(prev => ({ ...prev, min: true }));
    } else {
      setMaxPrice(value);
      // Mark as user edited to prevent automatic updates
      setUserEditedPrice(prev => ({ ...prev, max: true }));
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Category-specific search
  const handleCategorySearch = (e: FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Determine which categories are available
  const getCategoryAvailability = (slug: string) => {
    // In a category page, all categories are considered available
    if (categorySlug) return true;
    
    // If we have availability data from the API, use it
    if (filterOptions.categories && filterOptions.categories.length > 0) {
      const category = filterOptions.categories.find(c => c.slug === slug);
      return category ? category.available !== false : true;
    }
    
    // Default to available if we don't have data
    return true;
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
        value={searchInputValue}
        onChange={(e) => setSearchInputValue(e.target.value)}
      placeholder="Поиск"
      className="w-full p-2 border rounded-l"
      />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-3 rounded-r hover:bg-blue-600 transition"
            >
      Искать
      </button>
      </div>
      </form>
    )}
    
    <form onSubmit={handleSubmit} className="space-y-4">
        {/* Loading state */}
        {isLoading && filterOptions.districts.length === 0 && (
          <div className="text-center py-4">
            <div className="animate-pulse">Загрузка фильтров...</div>
          </div>
        )}
        
    {/* Multi-category selection (only on general search page) */}
    {!categorySlug && categories.length > 0 && (
      <div>
      <label className="block text-sm font-medium mb-1">Категории</label>
      <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isAvailable = getCategoryAvailability(cat.slug);
        return (
        <button
        key={cat.slug}
        type="button"
        onClick={() => handleCategoryToggle(cat.slug)}
        className={`px-3 py-1 rounded-full border text-sm ${
          selectedCategories.includes(cat.slug)
          ? 'bg-blue-500 text-white border-blue-500'
            : isAvailable
              ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-500 border-gray-200 opacity-60'
        }`}
          disabled={!isAvailable && !selectedCategories.includes(cat.slug)}
        >
        {cat.name}
        </button>
        );
      })}
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
              min={0}
    className="w-full p-2 border rounded"
    />
    </div>
    <div className="flex-1">
    <label className="block text-sm font-medium mb-1">Макс. цена</label>
    <input
    type="number"
    value={maxPrice}
    onChange={(e) => handlePriceChange('max', e.target.value)}
              min={0}
    className="w-full p-2 border rounded"
    />
    </div>
    </div>
    
        {/* Available Districts */}
    {filterOptions.districts.length > 0 && (
      <div>
      <label className="block text-sm font-medium mb-1">Районы</label>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
      {filterOptions.districts.map((dist) => (
        <button
          key={dist.value}
          type="button"
          onClick={() => handleDistrictToggle(dist.value)}
          className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1 ${
            selectedDistricts.includes(dist.value)
              ? 'bg-blue-500 text-white border-blue-500'
              : dist.count === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          disabled={false}
        >
          {dist.value}
          <span className="ml-1 text-xs text-gray-500">({dist.count})</span>
        </button>
      ))}
      </div>
      </div>
    )}
    
        {/* Available Conditions */}
    {filterOptions.conditions.length > 0 && (
      <div>
      <label className="block text-sm font-medium mb-1">Состояние</label>
      <div className="flex flex-wrap gap-2">
      {filterOptions.conditions.map((cond) => (
        <button
          key={cond.value}
          type="button"
          onClick={() => handleConditionToggle(cond.value)}
          className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1 ${
            selectedConditions.includes(cond.value)
              ? 'bg-blue-500 text-white border-blue-500'
              : cond.count === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          disabled={false}
        >
          {cond.value}
          <span className="ml-1 text-xs text-gray-500">({cond.count})</span>
        </button>
      ))}
      </div>
      </div>
    )}
    
        {/* Available Room Options */}
    {filterOptions.rooms.length > 0 && (
      <div>
      <label className="block text-sm font-medium mb-1">Комнаты</label>
      <div className="flex flex-wrap gap-2">
      {filterOptions.rooms.map((room) => (
        <button
          key={room.value}
          type="button"
          onClick={() => handleRoomToggle(room.value)}
          className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1 ${
            selectedRooms.includes(room.value)
              ? 'bg-blue-500 text-white border-blue-500'
              : room.count === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-60'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          disabled={false}
        >
          {room.value}
          <span className="ml-1 text-xs text-gray-500">({room.count})</span>
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