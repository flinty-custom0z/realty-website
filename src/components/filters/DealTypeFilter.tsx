'use client';

import { useDealType } from '@/contexts/DealTypeContext';
import DealTypeToggle from '@/components/DealTypeToggle';

export interface DealTypeFilterProps {
  current: 'rent' | 'sale';
  onChange: (dealType: string) => void;
}

export function DealTypeFilter({
  current,
  onChange
}: DealTypeFilterProps) {
  // Get the global deal type state to ensure synchronization
  const { dealType, setDealType } = useDealType();
  
  // Handle changes by calling both the local handler and global context
  const handleDealTypeChange = (type: 'rent' | 'sale') => {
    // Update global context first (this will update other toggles)
    setDealType(type);
    
    // Then call the local handler for FilterSidebar state update
    onChange(type === 'rent' ? 'RENT' : 'SALE');
  };

  return (
    <div className="filter-section mb-5">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Тип сделки</h3>
      <div className="mt-2">
        <DealTypeToggle 
          // Use the dealType from context to ensure it's always in sync
          current={dealType}
          variant="sidebar" 
          showCounts={false}
          onChange={handleDealTypeChange}
        />
      </div>
    </div>
  );
} 