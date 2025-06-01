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
  PriceRangeFilter,
  PropertyTypeFilter
} from '@/components/filters';
import { FilterSidebarProps } from '@/types/filters';
import { useDealType } from '@/contexts/DealTypeContext';

export default function FilterSidebar({
  categorySlug = '',
  categories = [],
  searchQuery = '',
  filters,
  onChange,
  filteredCount,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // but preserve the deal type
    if (typeof onChange === 'function') {
      onChange({ deal: 'sale' });
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
        onChange({ deal: type === 'RENT' ? 'rent' : 'sale' });
      }
    },
    [filterStateDealTypeChange, setDealType, onChange]
  );
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 min-h-[800px]">
      {/* Header with filters count and reset button */}
      <FilterHeader
        totalCount={typeof filteredCount === 'number' ? filteredCount : state.visibleFilterOptions.totalCount}
        hasCustomFilters={hasCustomFilters()}
        onReset={handleResetFilters}
      />
      
      {/* Search within a category */}
      {categorySlug && (
        <CategorySearch
          value={state.searchInputValue}
          onChange={(value: string) => dispatch({ type: 'SET_SEARCH_INPUT', payload: value })}
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
          <div className={`transition-opacity duration-300 ${state.isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <CategoryFilter
              categories={categories}
              selected={state.selectedCategories}
              onChange={(category: string) => dispatch({ type: 'TOGGLE_CATEGORY', payload: category })}
              getCategoryAvailability={getCategoryAvailability}
            />
          </div>
        )}
        
        {/* Price Range - use opacity to handle loading state without layout shifts */}
        <div className={`transition-opacity duration-300 ${state.isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <PriceRangeFilter
            min={state.visibleFilterOptions.priceRange.min}
            max={state.visibleFilterOptions.priceRange.max}
            currentMin={state.minPrice ? parseInt(state.minPrice) : null}
            currentMax={state.maxPrice ? parseInt(state.maxPrice) : null}
            onChange={(min: number, max: number) => {
              dispatch({
                type: 'SET_PRICE_RANGE',
                payload: { min: min.toString(), max: max.toString() }
              });
            }}
            onInputChange={handlePriceChange}
            isLoading={state.isLoading}
          />
        </div>
        
        {/* Available Districts - use opacity to handle loading state without layout shifts */}
        <div className={`transition-opacity duration-300 ${state.isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <MultiSelectFilter
            title="Районы"
            options={state.visibleFilterOptions.districts}
            selected={state.selectedDistricts}
            onChange={(district: string) => dispatch({ type: 'TOGGLE_DISTRICT', payload: district })}
            maxHeight="12rem"
          />
        </div>
        
        {/* Property Types - only show when at least one category is selected */}
        {(state.selectedCategories.length > 0 || categorySlug) && (
          <div className={`transition-opacity duration-300 ${state.isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <PropertyTypeFilter
              propertyTypes={state.visibleFilterOptions.propertyTypes}
              selectedPropertyTypes={state.selectedPropertyTypes}
              onChange={(propertyType: string) => dispatch({ type: 'TOGGLE_PROPERTY_TYPE', payload: propertyType })}
              isLoading={state.isLoading}
            />
          </div>
        )}
        
        {/* Available Conditions - use opacity to handle loading state without layout shifts */}
        <div className={`transition-opacity duration-300 ${state.isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <MultiSelectFilter
            title="Состояние"
            options={state.visibleFilterOptions.conditions}
            selected={state.selectedConditions}
            onChange={(condition: string) => dispatch({ type: 'TOGGLE_CONDITION', payload: condition })}
          />
        </div>
        
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