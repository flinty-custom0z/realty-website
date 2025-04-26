// Fixed FilterSidebar.tsx
'use client';

import { useReducer, useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Range } from 'react-range';
import { useDealType } from '@/contexts/DealTypeContext';
import DealTypeToggle from '@/components/DealTypeToggle';

// Types
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
  dealTypes: DealTypeOption[];
  priceRange: {
    min: number;
    max: number;
    currentMin: number | null;
    currentMax: number | null;
  };
  categories: Category[];
  totalCount: number;
  hasFiltersApplied: boolean;
}

// Filter state interface
interface FilterState {
  // Filter values
  minPrice: string;
  maxPrice: string;
  selectedCategories: string[];
  selectedDistricts: string[];
  selectedConditions: string[];
  selectedRooms: string[];
  selectedDealType: string;
  searchInputValue: string;
  
  // UI & control states
  isLoading: boolean;
  userEditedPrice: {
    min: boolean;
    max: boolean;
  };
  filterOptions: FilterOptions;
  visibleFilterOptions: FilterOptions;
}

// Filter actions
type FilterAction =
  | { type: 'INIT_FROM_URL'; payload: any }
  | { type: 'SET_SEARCH_INPUT'; payload: string }
  | { type: 'TOGGLE_CATEGORY'; payload: string }
  | { type: 'TOGGLE_DISTRICT'; payload: string }
  | { type: 'TOGGLE_CONDITION'; payload: string }
  | { type: 'TOGGLE_ROOM'; payload: string }
  | { type: 'SET_PRICE'; payload: { type: 'min' | 'max'; value: string } }
  | { type: 'SET_PRICE_RANGE'; payload: { min: string; max: string } }
  | { type: 'SET_DEAL_TYPE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER_OPTIONS'; payload: FilterOptions }
  | { type: 'UPDATE_VISIBLE_OPTIONS' }
  | { type: 'RESET_FILTERS'; payload: { priceRange: { min: number; max: number; currentMin: number | null; currentMax: number | null } } };

// Default filter state
const initialFilterState: FilterState = {
  minPrice: '',
  maxPrice: '',
  selectedCategories: [],
  selectedDistricts: [],
  selectedConditions: [],
  selectedRooms: [],
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
    rooms: [],
    dealTypes: [],
    priceRange: { min: 0, max: 100000000, currentMin: null, currentMax: null },
    categories: [],
    totalCount: 0,
    hasFiltersApplied: false
  },
  visibleFilterOptions: {
    districts: [],
    conditions: [],
    rooms: [],
    dealTypes: [],
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
    case 'TOGGLE_ROOM':
      return {
        ...state,
        selectedRooms: state.selectedRooms.includes(action.payload)
          ? state.selectedRooms.filter(r => r !== action.payload)
          : [...state.selectedRooms, action.payload]
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
        selectedDealType: '',
      };
    default:
      return state;
  }
}

// Add debounce utility
function useDebounce<T>(value: T, delay: number): T {
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
  const { dealType: globalDealType, setDealType: setGlobalDealType } = useDealType();
  
  // Check if controlled mode (via props)
  const isControlled = typeof filters !== 'undefined' && typeof onChange === 'function';
  
  // Use reducer for filter state management
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);
  
  // Debounced state for API calls
  const debouncedState = useDebounce({
    searchInputValue: state.searchInputValue,
    selectedCategories: state.selectedCategories,
    selectedDistricts: state.selectedDistricts, 
    selectedConditions: state.selectedConditions,
    selectedRooms: state.selectedRooms,
    selectedDealType: state.selectedDealType,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice
  }, 300);
  
  // Refs for handling side effects
  const isInitialLoadRef = useRef(true);
  const isApplyingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestCounter = useRef(0);
  
  // Initialize state from URL or props (controlled mode)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      // Initialize the state based on URL params or controlled props
      if (isControlled && filters) {
        // Initialize from props in controlled mode
        dispatch({ 
          type: 'INIT_FROM_URL', 
          payload: {
            minPrice: filters.minPrice || '',
            maxPrice: filters.maxPrice || '',
            selectedCategories: filters.category || [],
            selectedDistricts: filters.district || [],
            selectedConditions: filters.condition || [],
            selectedRooms: filters.rooms || [],
            selectedDealType: filters.deal === 'rent' ? 'RENT' : 'SALE',
            searchInputValue: filters.q || searchQuery || '',
            userEditedPrice: {
              min: !!filters.minPrice,
              max: !!filters.maxPrice
            }
          }
        });
      } else {
        // Initialize from URL in uncontrolled mode
        const urlDealType = searchParams?.get('deal');
        const initialDealType = urlDealType === 'rent' ? 'RENT' : 'SALE';
        
        // Initialize search input
        const urlSearchInput = searchParams?.get('q') || searchQuery || '';
        
        // Initialize categories
        const urlCategories = searchParams?.getAll('category') || [];
        let effectiveCategories = urlCategories;
        
        // For rent, only allow apartments and commercial
        if (initialDealType === 'RENT' && urlCategories.length > 0) {
          effectiveCategories = urlCategories.filter(cat => 
            ['apartments', 'commercial'].includes(cat)
          );
        }
        
        // Initialize districts, conditions, and rooms
        const urlDistricts = searchParams?.getAll('district') || [];
        const urlConditions = searchParams?.getAll('condition') || [];
        const urlRooms = searchParams?.getAll('rooms') || [];
        
        // Initialize price range
        const urlMinPrice = searchParams?.get('minPrice') || '';
        const urlMaxPrice = searchParams?.get('maxPrice') || '';
        
        dispatch({ 
          type: 'INIT_FROM_URL', 
          payload: {
            minPrice: urlMinPrice,
            maxPrice: urlMaxPrice,
            selectedCategories: effectiveCategories,
            selectedDistricts: urlDistricts,
            selectedConditions: urlConditions,
            selectedRooms: urlRooms,
            selectedDealType: initialDealType,
            searchInputValue: urlSearchInput,
            userEditedPrice: {
              min: !!urlMinPrice,
              max: !!urlMaxPrice
            }
          }
        });
        
        // Sync with global deal type context
        setGlobalDealType(urlDealType === 'rent' ? 'rent' : 'sale');
      }
      
      isInitialLoadRef.current = false;
    }
  }, [searchParams, searchQuery, filters, isControlled, setGlobalDealType]);
  
  // Helper to fetch filter options from API
  const fetchFilterOptions = useCallback(async (applyPriceFilter = false) => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Update request counter
    const currentRequest = ++requestCounter.current;
    
    // Set loading after a small delay to prevent flashing
    const loadingTimer = setTimeout(() => {
      if (!state.isLoading) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
    }, 200); 
    
    try {
      // Build filter params
      const params = new URLSearchParams();
      
      // Add category filter
      if (state.selectedCategories.length > 0) {
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
      
      // Add room filter
      if (state.selectedRooms.length > 0) {
        state.selectedRooms.forEach(rooms => params.append('rooms', rooms));
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
        throw new Error('Failed to fetch filter options');
      }
      
      const data = await response.json();
      
      // Only update state if this is still the most recent request
      if (currentRequest === requestCounter.current) {
        dispatch({ type: 'SET_FILTER_OPTIONS', payload: data });
        
        // Schedule an update of visible options after a small delay
        setTimeout(() => {
          dispatch({ type: 'UPDATE_VISIBLE_OPTIONS' });
        }, 50);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Error fetching filter options:', error);
      }
    } finally {
      clearTimeout(loadingTimer);
      if (currentRequest === requestCounter.current) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [
    categorySlug, 
    state.selectedCategories, 
    state.selectedDistricts, 
    state.selectedConditions, 
    state.selectedRooms, 
    state.selectedDealType,
    state.minPrice,
    state.maxPrice,
    state.searchInputValue,
    state.isLoading
  ]);
  
  // Fetch filter options when debounced state changes
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      // Only fetch options if the component has been initialized
      fetchFilterOptions(false);
    }
  }, [
    debouncedState.selectedCategories,
    debouncedState.selectedDistricts,
    debouncedState.selectedConditions,
    debouncedState.selectedRooms,
    debouncedState.selectedDealType,
    fetchFilterOptions
  ]);
  
  // Fetch on search/price changes with lower priority
  useEffect(() => {
    if (!isInitialLoadRef.current && !isApplyingRef.current) {
      // Avoid fetching during explicit filter application
      fetchFilterOptions(false);
    }
  }, [
    debouncedState.searchInputValue,
    debouncedState.minPrice,
    debouncedState.maxPrice,
    fetchFilterOptions
  ]);
  
  // Initial fetch
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      fetchFilterOptions(false);
    }
  }, [fetchFilterOptions]);
  
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
      state.selectedRooms.length > 0 ||
      (!categorySlug && state.selectedCategories.length > 0);
    
    return hasSearchQuery || hasCustomPrice || hasOtherFilters || state.selectedDealType !== '';
  }, [
    categorySlug,
    state.searchInputValue,
    state.minPrice,
    state.maxPrice,
    state.selectedDistricts,
    state.selectedConditions,
    state.selectedRooms,
    state.selectedCategories,
    state.selectedDealType,
    state.filterOptions.priceRange
  ]);
  
  // Helper to format price with thousands separators
  function formatPriceInput(value: string) {
    if (!value) return '';
    const numeric = value.replace(/\D/g, '');
    if (!numeric) return '';
    return parseInt(numeric, 10).toLocaleString('ru-RU');
  }
  
  // Helper to parse formatted price input
  function parsePriceInput(formatted: string) {
    return formatted.replace(/\D/g, '');
  }
  
  // Helper to get proper Russian pluralization for listings count
  function getListingText(count: number) {
    if (count % 10 === 1 && count % 100 !== 11) {
      return 'объявление';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return 'объявления';
    } else {
      return 'объявлений';
    }
  }
  
  // Apply filters handler
  const applyFilters = useCallback(() => {
    if (isApplyingRef.current) return;
    isApplyingRef.current = true;
    
    try {
      // Fetch with applyPriceFilter=true to respect user price entries
      fetchFilterOptions(true);
      
      if (isControlled && onChange) {
        // In controlled mode, call onChange with new filters
        const newFilters: Record<string, any> = {};
        
        // Add search query
        if (state.searchInputValue) {
          if (categorySlug) {
            newFilters.categoryQuery = state.searchInputValue;
          } else {
            newFilters.q = state.searchInputValue;
          }
        }
        
        // Add price filters
        if (state.minPrice) newFilters.minPrice = state.minPrice;
        if (state.maxPrice) newFilters.maxPrice = state.maxPrice;
        
        // Add multi-select filters
        if (state.selectedCategories.length > 0) {
          newFilters.category = state.selectedCategories;
        }
        
        if (state.selectedDistricts.length > 0) {
          newFilters.district = state.selectedDistricts;
        }
        
        if (state.selectedConditions.length > 0) {
          newFilters.condition = state.selectedConditions;
        }
        
        if (state.selectedRooms.length > 0) {
          newFilters.rooms = state.selectedRooms;
        }
        
        // Add deal type (only for rent, not for sale which is default)
        if (state.selectedDealType === 'RENT') {
          newFilters.deal = 'rent';
        }
        
        onChange(newFilters);
      } else {
        // In uncontrolled mode, update URL
        const params = new URLSearchParams();
        
        // Add search query
        if (categorySlug) {
          if (state.searchInputValue.trim()) {
            params.append('categoryQuery', state.searchInputValue);
          }
        } else {
          const currentQuery = searchParams?.get('q');
          if (currentQuery) {
            params.append('q', currentQuery);
          }
        }
        
        // Add price filters
        if (state.minPrice) params.append('minPrice', state.minPrice);
        if (state.maxPrice) params.append('maxPrice', state.maxPrice);
        
        // Add multi-select filters
        if (state.selectedCategories.length > 0) {
          state.selectedCategories.forEach(c => params.append('category', c));
        }
        
        state.selectedDistricts.forEach(d => params.append('district', d));
        state.selectedConditions.forEach(c => params.append('condition', c));
        state.selectedRooms.forEach(r => params.append('rooms', r));
        
        // Add deal type (only for rent, not for sale which is default)
        if (state.selectedDealType === 'RENT') {
          params.append('deal', 'rent');
        }
        
        // Preserve navigation parameters
        const returnUrl = searchParams?.get('returnUrl');
        if (returnUrl) params.append('returnUrl', returnUrl);
        
        const fromParam = searchParams?.get('from');
        if (fromParam) params.append('from', fromParam);
        
        // Determine base URL
        let base;
        if (categorySlug) {
          base = `/listing-category/${categorySlug}`;
        } else if (pathname === '/') {
          base = '/';
        } else {
          base = '/search';
        }
        
        // Navigate with scroll=false to prevent page jumps
        router.push(`${base}?${params.toString()}`, { scroll: false });
        
        // Scroll to listings section if we're on the home page
        if (pathname === '/') {
          setTimeout(() => {
            const el = document.getElementById('listings-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 200);
        }
      }
    } finally {
      // Clear applying flag after a short delay
      setTimeout(() => {
        isApplyingRef.current = false;
      }, 200);
    }
  }, [
    state.searchInputValue,
    state.minPrice,
    state.maxPrice,
    state.selectedCategories,
    state.selectedDistricts,
    state.selectedConditions,
    state.selectedRooms,
    state.selectedDealType,
    categorySlug,
    fetchFilterOptions,
    isControlled,
    onChange,
    router,
    pathname,
    searchParams
  ]);
  
  // Reset filters handler
  const resetFilters = useCallback(() => {
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
    } else if (onChange) {
      // In controlled mode, clear all filters
      onChange({});
    }
    
    // Fetch updated filter options
    fetchFilterOptions(false);
  }, [
    state.filterOptions.priceRange,
    searchParams,
    pathname,
    categorySlug,
    isControlled,
    onChange,
    router,
    setGlobalDealType,
    fetchFilterOptions
  ]);
  
  // Deal type change handler
  const handleDealTypeChange = useCallback((dealType: string) => {
    const newDealType = dealType === 'RENT' ? 'RENT' : 'SALE';
    
    // Update local state
    dispatch({ type: 'SET_DEAL_TYPE', payload: newDealType });
    
    // Update global context
    setGlobalDealType(dealType === 'RENT' ? 'rent' : 'sale');
    
    // In controlled mode, update via onChange
    if (isControlled && onChange) {
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
      if (state.selectedRooms.length > 0) newFilters.rooms = state.selectedRooms;
      if (state.minPrice) newFilters.minPrice = state.minPrice;
      if (state.maxPrice) newFilters.maxPrice = state.maxPrice;
      
      onChange(newFilters);
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
    state.selectedRooms,
    state.minPrice, 
    state.maxPrice,
    isControlled,
    onChange,
    searchParams,
    pathname,
    router,
    setGlobalDealType,
    fetchFilterOptions
  ]);
  
  // Helper to determine category availability
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
  
  // Price input change handler
  const handlePriceChange = useCallback((type: 'min' | 'max', value: string) => {
    dispatch({
      type: 'SET_PRICE',
      payload: { type, value: parsePriceInput(value) }
    });
  }, []);
  
  // Form submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  }, [applyFilters]);
  
  // Category search handler
  const handleCategorySearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  }, [applyFilters]);
  
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
          {state.visibleFilterOptions.totalCount > 0 ? (
            <span>Найдено: {state.visibleFilterOptions.totalCount} {getListingText(state.visibleFilterOptions.totalCount)}</span>
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
              value={state.searchInputValue}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_INPUT', payload: e.target.value })}
              placeholder="Поиск в категории"
              className="w-full py-2 pl-10 pr-4 rounded-md bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
            />
          </div>
        </form>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loading state */}
        {state.isLoading && state.visibleFilterOptions.districts.length === 0 && (
          <div className="text-center py-2">
            <div className="animate-pulse text-sm text-gray-400">Загрузка фильтров...</div>
          </div>
        )}
        
        {/* Deal Type Selector */}
        <div className="filter-section mb-5">
          <h3 className="filter-section-title">Тип сделки</h3>
          <div className="mt-2">
            <DealTypeToggle 
              current={state.selectedDealType === 'RENT' ? 'rent' : 'sale'} 
              variant="sidebar" 
              showCounts={false}
              onChange={(type) => handleDealTypeChange(type === 'rent' ? 'RENT' : 'SALE')}
            />
          </div>
        </div>
        
        {/* Category selection (only on general search page) */}
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
                    onClick={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: cat.slug })}
                    className={`px-3 py-2 rounded-md text-sm transition-all ${
                      state.selectedCategories.includes(cat.slug)
                        ? 'bg-blue-500 text-white font-medium shadow-sm'
                        : isAvailable
                          ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          : 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
                    }`}
                    disabled={!isAvailable && !state.selectedCategories.includes(cat.slug)}
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
                value={formatPriceInput(state.minPrice)}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                min={0}
                className="w-full py-2 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                placeholder="От"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={formatPriceInput(state.maxPrice)}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                min={0}
                className="w-full py-2 px-3 rounded-md bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                placeholder="До"
              />
            </div>
          </div>
          
          {/* Price Range Slider */}
          {!state.isLoading && state.visibleFilterOptions.priceRange.min !== undefined && (
            <div className="px-1 py-2">
              <Range
                step={10000}
                min={state.visibleFilterOptions.priceRange.min}
                max={state.visibleFilterOptions.priceRange.max}
                values={[
                  Math.max(
                    Math.min(
                      state.minPrice ? parseInt(state.minPrice) : state.visibleFilterOptions.priceRange.min,
                      state.visibleFilterOptions.priceRange.max
                    ),
                    state.visibleFilterOptions.priceRange.min
                  ),
                  Math.min(
                    state.maxPrice ? parseInt(state.maxPrice) : state.visibleFilterOptions.priceRange.max,
                    state.visibleFilterOptions.priceRange.max
                  ),
                ]}
                onChange={([newMin, newMax]) => {
                  // Snap to nearest 10,000 except for min and max
                  const snap = (val: number, bound: number) => {
                    if (val === bound) return val;
                    return Math.round(val / 10000) * 10000;
                  };
                  
                  const snappedMin = snap(newMin, state.visibleFilterOptions.priceRange.min);
                  const snappedMax = snap(newMax, state.visibleFilterOptions.priceRange.max);
                  
                  dispatch({
                    type: 'SET_PRICE_RANGE',
                    payload: {
                      min: snappedMin.toString(),
                      max: snappedMax.toString()
                    }
                  });
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
                      key={key}
                      {...restThumbProps}
                      style={{
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
                <span>{state.visibleFilterOptions.priceRange.min.toLocaleString()} ₽</span>
                <span>{state.visibleFilterOptions.priceRange.max.toLocaleString()} ₽</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Available Districts */}
        {state.visibleFilterOptions.districts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Районы</h4>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
              {state.visibleFilterOptions.districts.map((dist) => (
                <button
                  key={dist.value}
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_DISTRICT', payload: dist.value })}
                  className={`px-3 py-2 rounded-md text-sm transition-all ${
                    state.selectedDistricts.includes(dist.value)
                      ? 'bg-blue-500 text-white font-medium shadow-sm'
                      : dist.available
                        ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        : 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
                  }`}
                  disabled={!dist.available && !state.selectedDistricts.includes(dist.value)}
                >
                  <span>{dist.value}</span>
                  <span className="ml-1 text-xs opacity-80">({dist.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Available Conditions */}
        {state.visibleFilterOptions.conditions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Состояние</h4>
            <div className="flex flex-wrap gap-2">
              {state.visibleFilterOptions.conditions.map((cond) => (
                <button
                  key={cond.value}
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_CONDITION', payload: cond.value })}
                  className={`px-3 py-2 rounded-md text-sm transition-all ${
                    state.selectedConditions.includes(cond.value)
                      ? 'bg-blue-500 text-white font-medium shadow-sm'
                      : cond.available
                        ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        : 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
                  }`}
                  disabled={!cond.available && !state.selectedConditions.includes(cond.value)}
                >
                  <span>{cond.value}</span>
                  <span className="ml-1 text-xs opacity-80">({cond.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Available Rooms */}
        {state.visibleFilterOptions.rooms.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Комнаты</h4>
            <div className="flex flex-wrap gap-2">
              {state.visibleFilterOptions.rooms.map((room) => (
                <button
                  key={room.value}
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_ROOM', payload: room.value })}
                  className={`px-3 py-2 rounded-md text-sm transition-all ${
                    state.selectedRooms.includes(room.value)
                      ? 'bg-blue-500 text-white font-medium shadow-sm'
                      : room.available
                        ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        : 'bg-gray-50 text-gray-400 opacity-60 border border-gray-200'
                  }`}
                  disabled={!room.available && !state.selectedRooms.includes(room.value)}
                >
                  <span>{room.value}</span>
                  <span className="ml-1 text-xs opacity-80">({room.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Apply Filters Button */}
        <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 mt-6">
          <button
            type="submit"
            disabled={state.isLoading || state.visibleFilterOptions.totalCount === 0}
            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
          >
            {state.isLoading ? 'Загрузка...' : 'Применить фильтры'}
          </button>
        </div>
      </form>
    </div>
  );
}