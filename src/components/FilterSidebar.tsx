// Fixed FilterSidebar.tsx
'use client';

import { useCallback } from 'react';
import { useFilterState } from '@/hooks/useFilterState';
import { 
  ApplyFiltersButton,
  CategoryFilter,
  CategorySearch,
  DealTypeFilter,
  FilterHeader,
  MultiSelectFilter,
  PriceRangeFilter
} from '@/components/filters';
import { FilterSidebarProps } from '@/types/filters';
import { useDealType } from '@/contexts/DealTypeContext';

export default function FilterSidebar({
  categorySlug = '',
  categories = [],
  searchQuery = '',
  filters,
  onChange,
}: FilterSidebarProps) {
  // Use the deal type context
  const { setDealType } = useDealType();
  
  // Use the filter state hook to manage state and side effects
  const {
    state,
    dispatch,
    applyFilters,
    resetFilters,
    handleDealTypeChange: filterStateDealTypeChange,
    handlePriceChange,
    hasCustomFilters,
    getCategoryAvailability,
    fetchFilterOptions
  } = useFilterState({
    categorySlug,
    initialFilters: filters,
    searchQuery
  });
  
  // Form submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // In controlled mode, we need to call the onChange prop with the filter values
    if (typeof onChange === 'function') {
      const filterValues = applyFilters();
      if (filterValues) {
        onChange(filterValues);
      }
    } else {
      // In uncontrolled mode, applyFilters will update the URL
      applyFilters();
    }
  }, [applyFilters, onChange]);
        
  // Category search handler
  const handleCategorySearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // In controlled mode, we need to call the onChange prop with the filter values
    if (typeof onChange === 'function') {
      const filterValues = applyFilters();
      if (filterValues) {
        onChange(filterValues);
      }
    } else {
      // In uncontrolled mode, applyFilters will update the URL
      applyFilters();
    }
  }, [applyFilters, onChange]);
  
  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    resetFilters();
    
    // In controlled mode, we need to call the onChange prop with empty filters
    if (typeof onChange === 'function') {
      onChange({});
    }
  }, [resetFilters, onChange]);

  // Handler for apply button click without event parameter
  const handleApplyClick = useCallback(() => {
    // In controlled mode, we need to call the onChange prop with the filter values
    if (typeof onChange === 'function') {
      const filterValues = applyFilters();
      if (filterValues) {
        onChange(filterValues);
      }
    } else {
      // In uncontrolled mode, applyFilters will update the URL
      applyFilters();
    }
  }, [applyFilters, onChange]);
  
  // Create a synchronized deal type handler that works with the DealTypeFilter component
  const handleLocalDealTypeChange = useCallback(
    (type: string) => {
      // update reducer so the sidebar UI stays in sync
      filterStateDealTypeChange(type);

      // let the *context* own the navigation; nothing else is necessary
      setDealType(type === 'RENT' ? 'rent' : 'sale');

      // controlled sidebars still need the final onChange()
      if (typeof onChange === 'function') {
        onChange({ deal: type === 'RENT' ? 'rent' : undefined });
      }
    },
    [filterStateDealTypeChange, setDealType, onChange]
  );
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      {/* Header with filters count and reset button */}
      <FilterHeader
        totalCount={state.visibleFilterOptions.totalCount}
        hasCustomFilters={hasCustomFilters()}
        onReset={handleResetFilters}
      />
      
      {/* Search within a category */}
      {categorySlug && (
        <CategorySearch
              value={state.searchInputValue}
          onChange={(value) => dispatch({ type: 'SET_SEARCH_INPUT', payload: value })}
          onSearch={handleCategorySearch}
            />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loading state */}
        {state.isLoading && state.visibleFilterOptions.districts.length === 0 && (
          <div className="text-center py-2">
            <div className="animate-pulse text-sm text-gray-400">Загрузка фильтров...</div>
          </div>
        )}
        
        {/* Deal Type Selector */}
        <DealTypeFilter 
              current={state.selectedDealType === 'RENT' ? 'rent' : 'sale'} 
          onChange={handleLocalDealTypeChange}
            />
        
        {/* Category selection (only on general search page) */}
        {!categorySlug && categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selected={state.selectedCategories}
            onChange={(category) => dispatch({ type: 'TOGGLE_CATEGORY', payload: category })}
            getCategoryAvailability={getCategoryAvailability}
          />
        )}
        
        {/* Price Range */}
        <PriceRangeFilter
                min={state.visibleFilterOptions.priceRange.min}
                max={state.visibleFilterOptions.priceRange.max}
          currentMin={state.minPrice ? parseInt(state.minPrice) : null}
          currentMax={state.maxPrice ? parseInt(state.maxPrice) : null}
          onChange={(min, max) => {
                  dispatch({
                    type: 'SET_PRICE_RANGE',
              payload: { min: min.toString(), max: max.toString() }
                  });
                }}
          onInputChange={handlePriceChange}
          isLoading={state.isLoading}
        />
        
        {/* Available Districts */}
        <MultiSelectFilter
          title="Районы"
          options={state.visibleFilterOptions.districts}
          selected={state.selectedDistricts}
          onChange={(district) => dispatch({ type: 'TOGGLE_DISTRICT', payload: district })}
          maxHeight="12rem"
        />
        
        {/* Available Conditions */}
        <MultiSelectFilter
          title="Состояние"
          options={state.visibleFilterOptions.conditions}
          selected={state.selectedConditions}
          onChange={(condition) => dispatch({ type: 'TOGGLE_CONDITION', payload: condition })}
        />
        
        {/* Available Rooms */}
        <MultiSelectFilter
          title="Комнаты"
          options={state.visibleFilterOptions.rooms}
          selected={state.selectedRooms}
          onChange={(rooms) => dispatch({ type: 'TOGGLE_ROOM', payload: rooms })}
        />
        
        {/* Apply Filters Button */}
        <ApplyFiltersButton
          onClick={handleApplyClick}
          isLoading={state.isLoading}
          disabled={state.visibleFilterOptions.totalCount === 0}
        />
      </form>
    </div>
  );
}