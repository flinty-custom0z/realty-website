import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDealType } from '@/contexts/DealTypeContext';
import { 
  FilterState, 
  FilterAction, 
  FilterOptions, 
  PriceRange 
} from '@/types/filters';

// Debounce utility
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Default filter state
const initialFilterState: FilterState = {
  minPrice: '',
  maxPrice: '',
  selectedCategories: [],
  selectedDistricts: [],
  selectedConditions: [],
  selectedPropertyTypes: [],
  selectedCities: [],
  selectedDealType: '',
  searchInputValue: '',
  isLoading: true,
  userEditedPrice: {
    min: false,
    max: false
  },
  filterOptions: {
    districts: [],
    conditions: [],
    dealTypes: [],
    propertyTypes: [],
    cities: [],
    priceRange: { min: 0, max: 100000000, currentMin: null, currentMax: null },
    categories: [],
    totalCount: 0,
    hasFiltersApplied: false
  },
  visibleFilterOptions: {
    districts: [],
    conditions: [],
    dealTypes: [],
    propertyTypes: [],
    cities: [],
    priceRange: { min: 0, max: 100000000, currentMin: null, currentMax: null },
    categories: [],
    totalCount: 0,
    hasFiltersApplied: false
  }
};

// Filter reducer function
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'INIT_FROM_URL':
      return {
        ...state,
        ...action.payload
      };
    case 'SET_SEARCH_INPUT':
      return {
        ...state,
        searchInputValue: action.payload
      };
    case 'TOGGLE_CATEGORY':
      return {
        ...state,
        selectedCategories: state.selectedCategories.includes(action.payload)
          ? state.selectedCategories.filter(c => c !== action.payload)
          : [...state.selectedCategories, action.payload]
      };
    case 'TOGGLE_DISTRICT':
      return {
        ...state,
        selectedDistricts: state.selectedDistricts.includes(action.payload)
          ? state.selectedDistricts.filter(d => d !== action.payload)
          : [...state.selectedDistricts, action.payload]
      };
    case 'TOGGLE_CONDITION':
      return {
        ...state,
        selectedConditions: state.selectedConditions.includes(action.payload)
          ? state.selectedConditions.filter(c => c !== action.payload)
          : [...state.selectedConditions, action.payload]
      };
    case 'TOGGLE_CITY':
      return {
        ...state,
        selectedCities: state.selectedCities.includes(action.payload)
          ? state.selectedCities.filter(c => c !== action.payload)
          : [...state.selectedCities, action.payload]
      };
    case 'TOGGLE_PROPERTY_TYPE':
      return {
        ...state,
        selectedPropertyTypes: state.selectedPropertyTypes.includes(action.payload)
          ? state.selectedPropertyTypes.filter(pt => pt !== action.payload)
          : [...state.selectedPropertyTypes, action.payload]
      };
    case 'SET_PRICE':
      return {
        ...state,
        [action.payload.type === 'min' ? 'minPrice' : 'maxPrice']: action.payload.value,
        userEditedPrice: {
          ...state.userEditedPrice,
          [action.payload.type]: true
        }
      };
    case 'SET_PRICE_RANGE':
      return {
        ...state,
        minPrice: action.payload.min,
        maxPrice: action.payload.max,
        userEditedPrice: {
          min: true,
          max: true
        }
      };
    case 'SET_DEAL_TYPE':
      return {
        ...state,
        selectedDealType: action.payload,
        // When changing deal type, filter categories for rent
        selectedCategories: action.payload === 'RENT'
          ? state.selectedCategories.filter(cat => ['apartments', 'commercial'].includes(cat))
          : state.selectedCategories
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_FILTER_OPTIONS':
      return {
        ...state,
        filterOptions: action.payload,
        // If user hasn't manually set prices, update from API response
        minPrice: (!state.userEditedPrice.min && action.payload.priceRange.min !== undefined)
          ? Math.min(action.payload.priceRange.min, action.payload.priceRange.max).toString()
          : state.minPrice,
        maxPrice: (!state.userEditedPrice.max && action.payload.priceRange.max !== undefined)
          ? action.payload.priceRange.max.toString()
          : state.maxPrice
      };
    case 'UPDATE_VISIBLE_OPTIONS':
      return {
        ...state,
        visibleFilterOptions: state.filterOptions
      };
    case 'RESET_FILTERS':
      return {
        ...initialFilterState,
        filterOptions: state.filterOptions,
        visibleFilterOptions: state.visibleFilterOptions,
        minPrice: Math.min(action.payload.priceRange.min, state.filterOptions.priceRange.max).toString(),
        maxPrice: Math.min(action.payload.priceRange.max, state.filterOptions.priceRange.max).toString(),
        searchInputValue: '',
        selectedDealType: 'SALE',
      };
    default:
      return state;
  }
}

// Helper functions
export function formatPriceInput(value: string): string {
  if (!value) return '';
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  return parseInt(numeric, 10).toLocaleString('ru-RU');
}

export function parsePriceInput(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

export function getListingText(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'объявление';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'объявления';
  } else {
    return 'объявлений';
  }
}

interface UseFilterStateOptions {
  categorySlug?: string;
  initialFilters?: Record<string, any>;
  searchQuery?: string;
}

export function useFilterState({
  categorySlug = '',
  initialFilters,
  searchQuery = ''
}: UseFilterStateOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { dealType: globalDealType, setDealType: setGlobalDealType } = useDealType();
  
  // Check if controlled mode (via props)
  const isControlled = typeof initialFilters !== 'undefined';
  
  // Use reducer for filter state management
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  
  // Refs for handling side effects
  const isInitialLoadRef = useRef(true);
  const isInitialized = useRef(false);
  const isApplyingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestCounter = useRef(0);
  
  // Function to clear any loading timers
  const clearLoadingTimers = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, []);
  
  // Helper to fetch filter options
  const fetchFilterOptions = useCallback(async (applyPriceFilter = false) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any pending loading timers
    clearLoadingTimers();
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Update request counter
    const currentRequest = ++requestCounter.current;
    
    // Set loading state handling - only set loading for initial load
    // For all other cases, use opacity transitions in the UI instead of loading state
    if (!isInitialized.current) {
      // Only set loading on initial load
      dispatch({ type: 'SET_LOADING', payload: true });
    } else if (applyPriceFilter) {
      // For user-initiated filter changes, use a longer delay to prevent flickering
      loadingTimerRef.current = setTimeout(() => {
        if (currentRequest === requestCounter.current) {
          dispatch({ type: 'SET_LOADING', payload: true });
        }
      }, 300); // Increased from 150ms to 300ms
    }
    // For automatic updates, don't set loading state at all - handled by CSS transitions
    
    try {
      // Build filter params
      const params = new URLSearchParams();
      
      // Add category filter
      if (categorySlug) {
        // For category pages, always include the current category
        params.append('category', categorySlug);
      } else if (state.selectedCategories.length > 0) {
        // For global search, include selected categories
        state.selectedCategories.forEach(category => params.append('category', category));
      }
      
      // Add district filter
      if (state.selectedDistricts.length > 0) {
        state.selectedDistricts.forEach(district => params.append('district', district));
      }
      
      // Add condition filter
      if (state.selectedConditions.length > 0) {
        state.selectedConditions.forEach(condition => params.append('condition', condition));
      }
      
      // Add city filter
      if (state.selectedCities.length > 0) {
        state.selectedCities.forEach(city => params.append('city', city));
      }
      
      // Add property type filter
      if (state.selectedPropertyTypes.length > 0) {
        state.selectedPropertyTypes.forEach(propertyType => params.append('propertyType', propertyType));
      }
      
      // Add price filters (always include in params)
      if (state.minPrice) {
        params.append('minPrice', state.minPrice);
      }
      
      if (state.maxPrice) {
        params.append('maxPrice', state.maxPrice);
      }
      
      // Flag to apply price filters (only when explicitly applying)
      params.append('applyPriceFilter', applyPriceFilter.toString());
      
      // Add deal type
      params.append('deal', state.selectedDealType === 'RENT' ? 'rent' : 'sale');
      
      // Add search query
      if (categorySlug && state.searchInputValue) {
        params.append('categoryQuery', state.searchInputValue);
      } else if (state.searchInputValue) {
        params.append('q', state.searchInputValue);
      }
      
      // Make API request
      const response = await fetch(`/api/filter-options?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filter options: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Only update state if this is still the most recent request
      if (currentRequest === requestCounter.current) {
        // Clear any pending loading timers
        clearLoadingTimers();
        
        // Update filter options
        dispatch({ type: 'SET_FILTER_OPTIONS', payload: data });
        
        // Update visible options
        dispatch({ type: 'UPDATE_VISIBLE_OPTIONS' });
        
        // Turn off loading state with a slight delay to allow CSS transitions to complete
        setTimeout(() => {
          if (currentRequest === requestCounter.current) {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }, 100);
        
        // Mark as initialized after first successful fetch
        isInitialized.current = true;
      }
    } catch (error) {
      // Only handle errors for the current request
      if (currentRequest === requestCounter.current) {
        // Clear any pending loading timers
        clearLoadingTimers();
        
        // Log non-abort errors
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Error fetching filter options:', error);
        }
        
        // Always turn off loading state, even on error
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    
    // Return a cleanup function
    return () => {
      // Clean up loading timer if component unmounts during fetch
      clearLoadingTimers();
    };
  }, [
    categorySlug, 
    state.selectedCategories, 
    state.selectedDistricts, 
    state.selectedConditions,
    state.selectedCities,
    state.selectedPropertyTypes,
    state.selectedDealType,
    state.minPrice,
    state.maxPrice,
    state.searchInputValue,
    clearLoadingTimers
  ]);
  
  // Clean up any pending timers or requests on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear any loading timers
      clearLoadingTimers();
    };
  }, [clearLoadingTimers]);
  
  // Initialize state from URL or props (controlled mode)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      // Initialize the state based on URL params or controlled props
      if (isControlled && initialFilters) {
        // Initialize from props in controlled mode
        dispatch({ 
          type: 'INIT_FROM_URL', 
          payload: {
            minPrice: initialFilters.minPrice || '',
            maxPrice: initialFilters.maxPrice || '',
            selectedCategories: initialFilters.category || [],
            selectedDistricts: initialFilters.district || [],
            selectedConditions: initialFilters.condition || [],
            selectedCities: initialFilters.city || [],
            selectedPropertyTypes: initialFilters.propertyType || [],
            selectedDealType: initialFilters.deal === 'rent' ? 'RENT' : 'SALE',
            searchInputValue: initialFilters.q || searchQuery || '',
            userEditedPrice: {
              min: !!initialFilters.minPrice,
              max: !!initialFilters.maxPrice
            }
          }
        });
      } else {
        // Initialize from URL in uncontrolled mode
        const urlDealType = searchParams?.get('deal');
        const initialDealType = urlDealType === 'rent' ? 'RENT' : 'SALE';
        
        // Get all URL params
        const urlCategories = searchParams?.getAll('category') || [];
        const urlDistricts = searchParams?.getAll('district') || [];
        const urlConditions = searchParams?.getAll('condition') || [];
        const urlCities = searchParams?.getAll('city') || [];
        const urlPropertyTypes = searchParams?.getAll('propertyType') || [];
        const urlMinPrice = searchParams?.get('minPrice') || '';
        const urlMaxPrice = searchParams?.get('maxPrice') || '';
        const urlQuery = searchParams?.get('q') || searchQuery || '';
        
        // Initialize state from URL
        dispatch({
          type: 'INIT_FROM_URL',
          payload: {
            minPrice: urlMinPrice,
            maxPrice: urlMaxPrice,
            selectedCategories: urlCategories,
            selectedDistricts: urlDistricts,
            selectedConditions: urlConditions,
            selectedCities: urlCities,
            selectedPropertyTypes: urlPropertyTypes,
            selectedDealType: initialDealType,
            searchInputValue: urlQuery,
            userEditedPrice: {
              min: !!urlMinPrice,
              max: !!urlMaxPrice
            }
          }
        });
      }
      
      // Mark initial load as complete
      isInitialLoadRef.current = false;
      
      // Fetch filter options
      fetchFilterOptions();
    }
  }, [isControlled, initialFilters, searchParams, searchQuery, fetchFilterOptions]);
  
  // Create debouncedState for filter selections
  const debouncedSelections = useDebounce({
    categories: state.selectedCategories,
    districts: state.selectedDistricts, 
    conditions: state.selectedConditions,
    cities: state.selectedCities,
    propertyTypes: state.selectedPropertyTypes,
    dealType: state.selectedDealType,
  }, 300);
  
  // Create a debounce for text input changes
  const debouncedTextInputs = useDebounce({
    searchInput: state.searchInputValue,
  }, 400);
  
  // Create a debounce for price changes
  const debouncedPrices = useDebounce({
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
  }, 500);
  
  // Fetch filter options when debounced selections change
  useEffect(() => {
    // Only trigger if initialized and not in the middle of an explicit apply
    if (isInitialized.current && !isApplyingRef.current) {
      fetchFilterOptions(false);
    }
  }, [
    debouncedSelections.categories,
    debouncedSelections.districts,
    debouncedSelections.conditions,
    debouncedSelections.cities,
    debouncedSelections.propertyTypes,
    debouncedSelections.dealType,
    fetchFilterOptions
  ]);
  
  // Fetch on search changes
  useEffect(() => {
    if (isInitialized.current && !isApplyingRef.current) {
      fetchFilterOptions(false);
    }
  }, [
    debouncedTextInputs.searchInput,
    fetchFilterOptions
  ]);
  
  // Fetch on price changes
  useEffect(() => {
    if (isInitialized.current && !isApplyingRef.current) {
      fetchFilterOptions(false);
    }
  }, [
    debouncedPrices.minPrice,
    debouncedPrices.maxPrice,
    fetchFilterOptions
  ]);
  
  // Determine if any custom filters are applied
  const hasCustomFilters = useCallback(() => {
    const hasSearchQuery = categorySlug && state.searchInputValue.trim() !== '';
    
    const hasCustomPrice = 
      (state.minPrice !== '' && 
       state.filterOptions.priceRange.min !== undefined && 
       parseInt(state.minPrice) !== state.filterOptions.priceRange.min) || 
      (state.maxPrice !== '' && 
       state.filterOptions.priceRange.max !== undefined && 
       parseInt(state.maxPrice) !== state.filterOptions.priceRange.max);
    
    const hasOtherFilters = 
      state.selectedDistricts.length > 0 || 
      state.selectedConditions.length > 0 || 
      (!categorySlug && state.selectedCategories.length > 0);
    
    return hasSearchQuery || hasCustomPrice || hasOtherFilters || state.selectedDealType !== '';
  }, [
    categorySlug,
    state.searchInputValue,
    state.minPrice,
    state.maxPrice,
    state.selectedDistricts,
    state.selectedConditions,
    state.selectedCategories,
    state.selectedDealType,
    state.filterOptions.priceRange
  ]);

  // Function to apply filters and update URL
  const applyFilters = useCallback(() => {
    // Don't apply if already in progress
    if (isApplyingRef.current) return;
    
    // Set flag to prevent duplicate applies
    isApplyingRef.current = true;
    
    // In controlled mode, just return the filter values
    if (isControlled) {
      // Build filter object
      const filters: Record<string, any> = {};
      
      // Add search query
      if (state.searchInputValue) {
        filters.q = state.searchInputValue;
      }
      
      // Add category filter
      if (state.selectedCategories.length > 0) {
        filters.category = state.selectedCategories;
      }
      
      // Add district filter
      if (state.selectedDistricts.length > 0) {
        filters.district = state.selectedDistricts;
      }
      
      // Add condition filter
      if (state.selectedConditions.length > 0) {
        filters.condition = state.selectedConditions;
      }
      
      // Add city filter
      if (state.selectedCities.length > 0) {
        filters.city = state.selectedCities;
      }
      
      // Add price filters
      if (state.minPrice) {
        filters.minPrice = state.minPrice;
      }
      
      if (state.maxPrice) {
        filters.maxPrice = state.maxPrice;
      }
      
      // Add deal type
      filters.deal = state.selectedDealType === 'RENT' ? 'rent' : 'sale';
      
      // Reset applying flag
      isApplyingRef.current = false;
      
      return filters;
    }
    
    // In uncontrolled mode, update the URL
    try {
      const params = new URLSearchParams();
      
      // Add category search query for category pages
      if (categorySlug && state.searchInputValue) {
        params.append('categoryQuery', state.searchInputValue);
      } else if (!categorySlug && state.searchInputValue) {
        // Global search on search page
        params.append('q', state.searchInputValue);
      }
      
      // Add district filters
      if (state.selectedDistricts.length > 0) {
        state.selectedDistricts.forEach(district => params.append('district', district));
      }
      
      // Add condition filters
      if (state.selectedConditions.length > 0) {
        state.selectedConditions.forEach(condition => params.append('condition', condition));
      }
      
      // Add city filters
      if (state.selectedCities.length > 0) {
        state.selectedCities.forEach(city => params.append('city', city));
      }
      
      // Add property type filters
      if (state.selectedPropertyTypes.length > 0) {
        state.selectedPropertyTypes.forEach(type => params.append('propertyType', type));
      }
      
      // Add price filters
      if (state.minPrice) {
        params.append('minPrice', state.minPrice);
      }
      
      if (state.maxPrice) {
        params.append('maxPrice', state.maxPrice);
      }
      
      // Add deal type (only if rent, sale is default)
      if (state.selectedDealType === 'RENT') {
        params.append('deal', 'rent');
      }
      
      // Add category filters (only for non-category pages)
      if (!categorySlug && state.selectedCategories.length > 0) {
        state.selectedCategories.forEach(category => params.append('category', category));
      }
      
      // Preserve navigation parameters
      const returnUrl = searchParams?.get('returnUrl');
      if (returnUrl) params.append('returnUrl', returnUrl);
      
      const fromParam = searchParams?.get('from');
      if (fromParam) params.append('from', fromParam);
      
      // Determine target URL
      let targetUrl;
      if (categorySlug) {
        // Category page
        targetUrl = `/listing-category/${categorySlug}`;
      } else if (pathname === '/') {
        // Home page
        targetUrl = '/';
      } else {
        // Search page
        targetUrl = '/search';
      }
      
      // Construct final URL
      const finalUrl = `${targetUrl}${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Navigate to the URL
      router.push(finalUrl);
      
      // Scroll to listings section on home page
      if (pathname === '/') {
        setTimeout(() => {
          const el = document.getElementById('listings-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }
      
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      // Reset applying flag
      isApplyingRef.current = false;
    }
  }, [
    isControlled,
    state.searchInputValue,
    state.selectedCategories,
    state.selectedDistricts,
    state.selectedConditions,
    state.selectedCities,
    state.selectedPropertyTypes,
    state.minPrice,
    state.maxPrice,
    state.selectedDealType,
    categorySlug,
    searchParams,
    pathname,
    router
  ]);
  
  // Reset filters handler
  const resetFilters = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any loading timers
    clearLoadingTimers();
    
    // Reset to initial state but keep filter options
    dispatch({ 
      type: 'RESET_FILTERS', 
      payload: {
        priceRange: {
          ...state.filterOptions.priceRange,
          currentMin: null,
          currentMax: null
        }
      }
    });
    
    // Reset global deal type to 'sale' (default)
    setGlobalDealType('sale');
    
    // Handle URLs in uncontrolled mode
    if (!isControlled) {
      const params = new URLSearchParams();
      
      // Preserve global search query
      const currentQuery = searchParams?.get('q');
      if (currentQuery && pathname === '/search') {
        params.append('q', currentQuery);
      }
      
      // Keep navigation parameters
      const returnUrl = searchParams?.get('returnUrl');
      if (returnUrl) params.append('returnUrl', returnUrl);
      
      const fromParam = searchParams?.get('from');
      if (fromParam) params.append('from', fromParam);
      
      // Determine URL
      let base;
      if (categorySlug) {
        base = `/listing-category/${categorySlug}`;
      } else if (pathname === '/') {
        base = '/';
      } else {
        base = '/search';
      }
      
      router.push(`${base}${params.toString() ? `?${params.toString()}` : ''}`);
      
      if (pathname === '/') {
        setTimeout(() => {
          const el = document.getElementById('listings-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }
    }
    
    // Fetch updated filter options
    fetchFilterOptions(false);
  }, [
    state.filterOptions.priceRange,
    searchParams,
    pathname,
    categorySlug,
    isControlled,
    router,
    setGlobalDealType,
    fetchFilterOptions,
    clearLoadingTimers
  ]);

  // Deal type change handler
  const handleDealTypeChange = useCallback((dealType: string) => {
    const newDealType = dealType === 'RENT' ? 'RENT' : 'SALE';
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any loading timers
    clearLoadingTimers();
    
    // Update local state
    dispatch({ type: 'SET_DEAL_TYPE', payload: newDealType });
    
    // Update global context
    setGlobalDealType(dealType === 'RENT' ? 'rent' : 'sale');
    
    // In controlled mode, update via onChange
    if (isControlled) {
      const newFilters: Record<string, any> = {};
      
      // Set deal type
      if (newDealType === 'RENT') {
        newFilters.deal = 'rent';
      }
      
      // Filter categories for rent
      if (newDealType === 'RENT' && state.selectedCategories.length > 0) {
        const validCategories = state.selectedCategories.filter(cat => 
          ['apartments', 'commercial'].includes(cat)
        );
        if (validCategories.length > 0) {
          newFilters.category = validCategories;
        }
      } else if (state.selectedCategories.length > 0) {
        newFilters.category = state.selectedCategories;
      }
      
      // Include other filters
      if (state.selectedDistricts.length > 0) newFilters.district = state.selectedDistricts;
      if (state.selectedConditions.length > 0) newFilters.condition = state.selectedConditions;
      if (state.minPrice) newFilters.minPrice = state.minPrice;
      if (state.maxPrice) newFilters.maxPrice = state.maxPrice;
      
      return newFilters;
    } else if (!isControlled) {
      // In uncontrolled mode, update URL parameters
      const updatedParams = new URLSearchParams(searchParams?.toString() || '');
      
      // Update deal type parameter
      if (newDealType === 'RENT') {
        updatedParams.set('deal', 'rent');
      } else {
        updatedParams.delete('deal');
      }
      
      // Update category parameters
      updatedParams.delete('category');
      const effectiveCategories = newDealType === 'RENT'
        ? state.selectedCategories.filter(cat => ['apartments', 'commercial'].includes(cat))
        : state.selectedCategories;
      
      effectiveCategories.forEach(cat => {
        updatedParams.append('category', cat);
      });
      
      // Update URL without page reload
      const newUrl = pathname + (updatedParams.toString() ? `?${updatedParams.toString()}` : '');
      router.push(newUrl, { scroll: false });
    }
    
    // Always fetch updated filter options when deal type changes
    setTimeout(() => {
      fetchFilterOptions(false);
    }, 50);
  }, [
    state.selectedCategories,
    state.selectedDistricts,
    state.selectedConditions,
    state.minPrice, 
    state.maxPrice,
    isControlled,
    searchParams,
    pathname,
    router,
    setGlobalDealType,
    fetchFilterOptions,
    clearLoadingTimers
  ]);

  // Handle price change
  const handlePriceChange = useCallback((type: 'min' | 'max', value: string) => {
    dispatch({
      type: 'SET_PRICE',
      payload: { type, value: parsePriceInput(value) }
    });
  }, []);

  // Get category availability
  const getCategoryAvailability = useCallback((slug: string) => {
    // On a category page, all categories are available
    if (categorySlug) return true;
    
    // For rent, only allow apartments and commercial
    if (state.selectedDealType === 'RENT') {
      return ['apartments', 'commercial'].includes(slug);
    }
    
    // Use API availability data if available
    if (state.visibleFilterOptions.categories && state.visibleFilterOptions.categories.length > 0) {
      const category = state.visibleFilterOptions.categories.find(c => c.slug === slug);
      return category ? category.available !== false : true;
    }
    
    return true;
  }, [
    categorySlug,
    state.selectedDealType,
    state.visibleFilterOptions.categories
  ]);

  return {
    state,
    dispatch,
    fetchFilterOptions,
    applyFilters,
    resetFilters,
    handleDealTypeChange,
    handlePriceChange,
    hasCustomFilters,
    getCategoryAvailability,
    isInitialized: isInitialized.current
  };
} 