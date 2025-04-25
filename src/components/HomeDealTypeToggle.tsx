'use client';

import { useDealType } from '@/contexts/DealTypeContext';
import DealTypeToggle from '@/components/DealTypeToggle';

export default function HomeDealTypeToggle() {
  const { dealType, setDealType } = useDealType();
  
  return (
    <div className="flex justify-center mb-8">
      <DealTypeToggle 
        current={dealType} 
        onChange={setDealType}
        variant="default"
        showCounts={false}
      />
    </div>
  );
} 