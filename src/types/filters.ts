// Types for filter system
export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  available?: boolean;
}

export interface PropertyType {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  count?: number;
  available?: boolean;
}

export interface FilterOption {
  value: string;
  count: number;
  available: boolean;
}

export interface DealTypeOption {
  value: string;
  label: string;
  count: number;
  available: boolean;
}

export interface PriceRange {
  min: number;
  max: number;
  currentMin: number | null;
  currentMax: number | null;
}

export interface FilterOptions {
  districts: FilterOption[];
  conditions: FilterOption[];
  rooms: FilterOption[];
  dealTypes: DealTypeOption[];
  propertyTypes: PropertyType[];
  priceRange: PriceRange;
  categories: Category[];
  totalCount: number;
  hasFiltersApplied: boolean;
}

export interface FilterState {
  // Filter values
  minPrice: string;
  maxPrice: string;
  selectedCategories: string[];
  selectedDistricts: string[];
  selectedConditions: string[];
  selectedRooms: string[];
  selectedPropertyTypes: string[];
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

export type FilterAction =
  | { type: 'INIT_FROM_URL'; payload: Record<string, unknown> }
  | { type: 'SET_SEARCH_INPUT'; payload: string }
  | { type: 'TOGGLE_CATEGORY'; payload: string }
  | { type: 'TOGGLE_DISTRICT'; payload: string }
  | { type: 'TOGGLE_CONDITION'; payload: string }
  | { type: 'TOGGLE_ROOM'; payload: string }
  | { type: 'TOGGLE_PROPERTY_TYPE'; payload: string }
  | { type: 'SET_PRICE'; payload: { type: 'min' | 'max'; value: string } }
  | { type: 'SET_PRICE_RANGE'; payload: { min: string; max: string } }
  | { type: 'SET_DEAL_TYPE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER_OPTIONS'; payload: FilterOptions }
  | { type: 'UPDATE_VISIBLE_OPTIONS' }
  | { type: 'RESET_FILTERS'; payload: { priceRange: PriceRange } };

export interface FilterParams {
  selectedCategories: string[];
  selectedDistricts: string[];
  selectedConditions: string[];
  selectedRooms: string[];
  selectedPropertyTypes: string[];
  selectedDealType: string;
  minPrice: string;
  maxPrice: string;
  searchInputValue: string;
  categorySlug?: string;
}

export interface FilterSidebarProps {
  categorySlug?: string;
  categories?: Category[];
  searchQuery?: string;
  filters?: Record<string, unknown>;
  onChange?: (filters: Record<string, unknown>) => void;
  filteredCount?: number;
} 