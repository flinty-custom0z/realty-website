'use client';

import { useDealType } from '@/contexts/DealTypeContext';
import DealTypeToggle from '@/components/DealTypeToggle';
import { useEffect, useState } from 'react';

export default function HomeDealTypeToggle() {
  const { dealType, setDealType } = useDealType();
  const [counts, setCounts] = useState({ sale: 0, rent: 0 });
  
  // Fetch counts for sale and rent on component mount
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch('/api/filter-options');
        if (res.ok) {
          const data = await res.json();
          const saleCount = data.dealTypes.find((dt: any) => dt.value === 'SALE')?.count || 0;
          const rentCount = data.dealTypes.find((dt: any) => dt.value === 'RENT')?.count || 0;
          setCounts({ sale: saleCount, rent: rentCount });
        }
      } catch (error) {
        console.error('Error fetching deal type counts:', error);
      }
    }
    
    fetchCounts();
  }, []);
  
  return (
    <div className="flex justify-center mb-8">
      <DealTypeToggle 
        current={dealType} 
        onChange={setDealType}
        variant="default"
        showCounts={true}
        counts={counts}
      />
    </div>
  );
} 