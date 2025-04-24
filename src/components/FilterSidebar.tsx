'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Range } from 'react-range';

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

interface DealTypeOption {
  value: string;
  label: string;
  count: number;
  available: boolean;
}

interface FilterOptions {
  districts: FilterOption[];
  conditions: FilterOption[];
  rooms: FilterOption[];
  categories: Category[];
  dealTypes: DealTypeOption[];
  priceRange: {
    min: number;
    max: number;
  };
  totalCount: number;
  hasFiltersApplied: boolean;
}

interface FilterSidebarProps {
  categorySlug?: string;
  categories?: Category[];
  searchQuery?: string;
  filters?: Record<string, any>;
  onChange?: (filters: Record<string, any>) => void;
}

export default function FilterSidebar({
  categorySlug = '',
  categories = [],
  searchQuery = '',
  filters,
  onChange,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // If controlled, use props for state
  const isControlled = typeof filters !== 'undefined' && typeof onChange === 'function';
  
  // State for search input (for category-specific search)
  const [searchInputValue, setSearchInputValue] = useState(searchQuery || (isControlled ? filters.q || '' : ''));
  
  // States for filter values
  const [minPrice, setMinPrice] = useState(isControlled ? filters.minPrice || '' : searchParams?.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(isControlled ? filters.maxPrice || '' : searchParams?.get('maxPrice') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(isControlled ? filters.category || [] : searchParams?.getAll('category') || []);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(isControlled ? filters.district || [] : searchParams?.getAll('district') || []);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(isControlled ? filters.condition || [] : searchParams?.getAll('condition') || []);
  const [selectedRooms, setSelectedRooms] = useState<string[]>(isControlled ? filters.rooms || [] : searchParams?.getAll('rooms') || []);
  const [selectedDealType, setSelectedDealType] = useState(isControlled ? filters.dealType || '' : searchParams?.get('dealType') || 'SALE');
  
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
    dealTypes: [],
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
    const dealTypeParam = searchParams.get('dealType');
    
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

    if (dealTypeParam !== null) {
      setSelectedDealType(dealTypeParam);
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
  }, [selectedDistricts, selectedConditions, selectedRooms, selectedCategories, selectedDealType]);
  
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
    if (selectedCategories.length > 0) {
      selectedCategories.forEach((c: string) => params.append('category', c));
    }
    if (selectedDistricts.length > 0) {
      selectedDistricts.forEach((d: string) => params.append('district', d));
    }
    if (selectedConditions.length > 0) {
      selectedConditions.forEach((c: string) => params.append('condition', c));
    }
    if (selectedRooms.length > 0) {
      selectedRooms.forEach((r: string) => params.append('rooms', r));
    }
    if (selectedDealType) {
      params.append('dealType', selectedDealType);
    }

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
    
    const dealTypeChanged = selectedDealType !== 'SALE';
    return hasSearchQuery || hasCustomPrice || hasOtherFilters || dealTypeChanged;
  };
  
  // Helper to scroll to listings section after navigation
  const scrollToListings = () => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('listings-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  // Handler for controlled mode
  const updateFilters = (newFilters: Record<string, any>) => {
    if (isControlled && onChange) {
      onChange(newFilters);
    }
    if ('dealType' in newFilters) setSelectedDealType(newFilters.dealType);
  };

  // In controlled mode, update local state when filters prop changes
  useEffect(() => {
    if (isControlled && filters) {
      setSearchInputValue(filters.q || '');
      setMinPrice(filters.minPrice || '');
      setMaxPrice(filters.maxPrice || '');
      setSelectedCategories(filters.category || []);
      setSelectedDistricts(filters.district || []);
      setSelectedConditions(filters.condition || []);
      setSelectedRooms(filters.rooms || []);
      setSelectedDealType(filters.dealType || 'SALE');
    }
  }, [isControlled, filters]);
  
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
        selectedCategories.forEach((c: string) => params.append('category', c));
      }
      
      selectedDistricts.forEach((d: string) => params.append('district', d));
      selectedConditions.forEach((c: string) => params.append('condition', c));
      selectedRooms.forEach((r: string) => params.append('rooms', r));
      
      // Add deal type to query params
      if (selectedDealType) {
        params.append('dealType', selectedDealType);
      }
      
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
      let base;
      if (categorySlug) {
        base = `/listing-category/${categorySlug}`;
      } else if (pathname === '/') {
        base = '/';
      } else {
        base = '/search';
      }
      if (isControlled) {
        // Build new filters object
        const newFilters: Record<string, any> = {
          q: searchInputValue,
          minPrice,
          maxPrice,
          category: selectedCategories,
          district: selectedDistricts,
          condition: selectedConditions,
          rooms: selectedRooms,
          dealType: selectedDealType,
        };
        updateFilters(newFilters);
      } else {
      router.push(`${base}?${params.toString()}`);
        if (pathname === '/') {
          setTimeout(scrollToListings, 200);
        }
      }
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
    setSelectedDealType('SALE');
    
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
    let base;
    if (categorySlug) {
      base = `/listing-category/${categorySlug}`;
    } else if (pathname === '/') {
      base = '/';
    } else {
      base = '/search';
    }
    if (isControlled) {
      updateFilters({});
    } else {
    router.push(`${base}${params.toString() ? `?${params.toString()}` : ''}`);
      if (pathname === '/') {
        setTimeout(scrollToListings, 200);
      }
    }
  };
  
  // Handler functions for filter changes (use functional updates)
  const handleCategoryToggle = (slug: string) => {
    shouldUpdatePrices.current = true;
    setSelectedCategories((prev: string[]) =>
      prev.includes(slug) ? prev.filter((s: string) => s !== slug) : [...prev, slug]
    );
  };
  
  const handleDistrictToggle = (district: string) => {
    shouldUpdatePrices.current = true;
    setSelectedDistricts((prev: string[]) =>
      prev.includes(district) ? prev.filter((d: string) => d !== district) : [...prev, district]
    );
  };
  
  const handleConditionToggle = (cond: string) => {
    shouldUpdatePrices.current = true;
    setSelectedConditions((prev: string[]) =>
      prev.includes(cond) ? prev.filter((c: string) => c !== cond) : [...prev, cond]
    );
  };
  
  const handleRoomToggle = (room: string) => {
    shouldUpdatePrices.current = true;
    setSelectedRooms((prev: string[]) =>
      prev.includes(room) ? prev.filter((r: string) => r !== room) : [...prev, room]
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
    
    // For rent, only show apartments and commercial
    if (selectedDealType === 'RENT') {
      return ['apartments', 'commercial'].includes(slug);
    }
    
    // If we have availability data from the API, use it
    if (filterOptions.categories && filterOptions.categories.length > 0) {
      const category = filterOptions.categories.find(c => c.slug === slug);
      return category ? category.available !== false : true;
    }
    
    // Default to available if we don't have data
    return true;
  };
  
  // Add a helper to format numbers with spaces as thousands separators
  function formatPriceInput(value: string) {
    if (!value) return '';
    // Remove all non-digit characters
    const numeric = value.replace(/\D/g, '');
    if (!numeric) return '';
    // Format with spaces
    return parseInt(numeric, 10).toLocaleString('ru-RU');
  }

  // Add a helper to parse formatted input back to a number string
  function parsePriceInput(formatted: string) {
    return formatted.replace(/\D/g, '');
  }
  
  // Function to get correct Russian pluralization for listings count
  function getListingText(count: number) {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'объявление';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'объявления';
    } else {
      return 'объявлений';
    }
  }

  const handleDealTypeChange = (dealType: string) => {
    const newDealType = selectedDealType === dealType ? 'SALE' : dealType; // Default to SALE if deselected
    setSelectedDealType(newDealType);
    
    // Update filters right away
    const newFilters: Record<string, any> = {};
    if (newDealType) {
      newFilters.dealType = newDealType;
    }
    
    // Include current category selections
    if (selectedCategories.length > 0) {
      newFilters.category = selectedCategories;
    }
    
    // Clear category selections that don't apply to the deal type
    if (newDealType === 'RENT') {
      const validCategories = selectedCategories.filter(cat => 
        ['apartments', 'commercial'].includes(cat)
      );
      if (validCategories.length !== selectedCategories.length) {
        newFilters.category = validCategories;
        setSelectedCategories(validCategories);
      }
    }
    
    updateFilters(newFilters);
    
    // If not controlled mode, update URL and refresh
    if (!isControlled) {
      applyFilters();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-800 font-medium">Фильтры</h3>
          {hasCustomFilters() && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>
        <div className="text-sm text-gray-500 mb-2">
          {filterOptions.totalCount > 0 ? (
            <span>Найдено: {filterOptions.totalCount} {getListingText(filterOptions.totalCount)}</span>
          ) : (
            <span>Нет объявлений по заданным параметрам</span>
          )}
        </div>
      </div>
      
      {/* Search within a category */}
      {categorySlug && (
        <form onSubmit={handleCategorySearch} className="mb-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="Поиск в категории"
              className="w-full py-2 pl-10 pr-4 rounded-md bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
            />
          </div>
        </form>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loading state */}
        {isLoading && filterOptions.districts.length === 0 && (
          <div className="text-center py-2">
            <div className="animate-pulse text-sm text-gray-400">Загрузка фильтров...</div>
          </div>
        )}
        
        {/* Deal Type Selector */}
        <div className="filter-section mb-5">
          <h3 className="filter-section-title">Тип</h3>
          <div className="deal-type-selector flex space-x-3 mt-2">
            {filterOptions.dealTypes && filterOptions.dealTypes.map((dealType) => (
              <button
                key={dealType.value}
                type="button"
                onClick={() => handleDealTypeChange(dealType.value)}
                className={`flex-1 px-4 py-2.5 border rounded-md transition-colors ${
                  selectedDealType === dealType.value
                    ? 'bg-blue-500 text-white border-blue-500 font-medium shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                }`}
              >
                <span>{dealType.label}</span>
                <span className={`ml-1 text-xs ${selectedDealType === dealType.value ? 'text-blue-100' : 'text-gray-400'}`}>
                  ({dealType.count})
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Multi-category selection (only on general search page) */}
        {!categorySlug && categories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Категории</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isAvailable = getCategoryAvailability(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.slug)}
                    className={`px-3 py-2 rounded-md text-sm transition-all ${
                      selectedCategories.includes(cat.slug)
                        ? 'bg-blue-500 text-white font-medium shadow-sm'
                        : isAvailable
                          ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          : 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
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
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-gray-700">Цена, ₽</h4>
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={formatPriceInput(minPrice)}
                onChange={(e) => handlePriceChange('min', parsePriceInput(e.target.value))}
                min={0}
                className="w-full py-2 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                placeholder="От"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={formatPriceInput(maxPrice)}
                onChange={(e) => handlePriceChange('max', parsePriceInput(e.target.value))}
                min={0}
                className="w-full py-2 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                placeholder="До"
              />
            </div>
          </div>
          {/* Price Range Slider */}
          <div className="px-1 py-2">
            <Range
              step={10000}
              min={filterOptions.priceRange.min}
              max={filterOptions.priceRange.max}
              values={[
                minPrice ? parseInt(minPrice) : filterOptions.priceRange.min,
                maxPrice ? parseInt(maxPrice) : filterOptions.priceRange.max,
              ]}
              onChange={([newMin, newMax]) => {
                // Snap to nearest 10,000 except for min and max
                const snap = (val: number, bound: number) => {
                  if (val === bound) return val;
                  return Math.round(val / 10000) * 10000;
                };
                const snappedMin = snap(newMin, filterOptions.priceRange.min);
                const snappedMax = snap(newMax, filterOptions.priceRange.max);
                setMinPrice(snappedMin.toString());
                setMaxPrice(snappedMax.toString());
                setUserEditedPrice({ min: true, max: true });
              }}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '4px',
                    background: '#e5e7eb',
                    borderRadius: '2px',
                    margin: '16px 0',
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                // Explicitly destructure key and style, then spread the rest
                const { key, style, ...restThumbProps } = props;
                return (
                  <div
                    key={key} // Pass the key directly
                    {...restThumbProps} // Spread the remaining props
                    style={{ // Apply style separately, merging original and custom
                      ...style,
                      height: '18px',
                      width: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#4b5563',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      outline: 'none',
                    }}
                  />
                );
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{filterOptions.priceRange.min.toLocaleString()} ₽</span>
              <span>{filterOptions.priceRange.max.toLocaleString()} ₽</span>
            </div>
          </div>
        </div>
        
        {/* Available Districts */}
        {filterOptions.districts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Районы</h4>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
              {filterOptions.districts.map((dist) => (
                <button
                  key={dist.value}
                  type="button"
                  onClick={() => handleDistrictToggle(dist.value)}
                  className={`px-3 py-2 rounded-md text-sm transition-all ${
                    selectedDistricts.includes(dist.value)
                      ? 'bg-blue-500 text-white font-medium shadow-sm'
                      : dist.count === 0
                        ? 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  disabled={!dist.available && !selectedDistricts.includes(dist.value)}
                >
                  <span>{dist.value}</span>
                  <span className="ml-1 text-xs opacity-80">({dist.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Available Conditions */}
        {filterOptions.conditions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Состояние</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.conditions.map((cond) => (
                <button
                  key={cond.value}
                  type="button"
                  onClick={() => handleConditionToggle(cond.value)}
                  className={`px-3 py-2 rounded-md text-sm transition-all ${
                    selectedConditions.includes(cond.value)
                      ? 'bg-blue-500 text-white font-medium shadow-sm'
                      : cond.count === 0
                        ? 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  disabled={!cond.available && !selectedConditions.includes(cond.value)}
                >
                  <span>{cond.value}</span>
                  <span className="ml-1 text-xs opacity-80">({cond.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Available Rooms */}
        {filterOptions.rooms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Комнаты</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.rooms.map((room) => (
                <button
                  key={room.value}
                  type="button"
                  onClick={() => handleRoomToggle(room.value)}
                  className={`px-3 py-2 rounded-md text-sm transition-all ${
                    selectedRooms.includes(room.value)
                      ? 'bg-blue-500 text-white font-medium shadow-sm'
                      : room.count === 0
                        ? 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  disabled={!room.available && !selectedRooms.includes(room.value)}
                >
                  <span>{room.value}</span>
                  <span className="ml-1 text-xs opacity-80">({room.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {!isControlled && (
          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 mt-6">
            <button
              type="submit"
              disabled={isLoading || filterOptions.totalCount === 0}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isLoading ? 'Загрузка...' : 'Применить фильтры'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}