'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

type DealType = 'sale' | 'rent';

interface DealTypeContextType {
  dealType: DealType;
  setDealType: (type: DealType) => void;
  isDealTypeRent: boolean;
}

const DealTypeContext = createContext<DealTypeContextType | undefined>(undefined);

export function DealTypeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dealType, setDealTypeState] = useState<DealType>('sale');
  
  // Sync state with URL
  useEffect(() => {
    const dealParam = searchParams?.get('deal');
    if (dealParam === 'rent') {
      setDealTypeState('rent');
    } else {
      setDealTypeState('sale');
    }
  }, [searchParams]);
  
  // Update URL when dealType changes
  const setDealType = (type: DealType) => {
    const params = new URLSearchParams(searchParams?.toString());
    
    if (type === 'sale') {
      params.delete('deal');
    } else {
      params.set('deal', 'rent');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <DealTypeContext.Provider 
      value={{ 
        dealType, 
        setDealType,
        isDealTypeRent: dealType === 'rent'
      }}
    >
      {children}
    </DealTypeContext.Provider>
  );
}

export function useDealType() {
  const context = useContext(DealTypeContext);
  if (context === undefined) {
    throw new Error('useDealType must be used within a DealTypeProvider');
  }
  return context;
} 