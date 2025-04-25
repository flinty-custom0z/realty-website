'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  // Keep track of scroll position for deal type changes
  const scrollPositionRef = useRef<number>(0);
  
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
    // Remember current scroll position
    scrollPositionRef.current = window.scrollY;
    
    const params = new URLSearchParams(searchParams?.toString());
    
    if (type === 'sale') {
      params.delete('deal');
    } else {
      params.set('deal', 'rent');
    }
    
    // Use scroll=false to prevent page jump
    router.push(`${pathname}?${params.toString()}`, { 
      scroll: false
    });
    
    // Apply the state change immediately for a more responsive UI
    setDealTypeState(type);
    
    // After route change, restore scroll position
    setTimeout(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: 'auto' // Use 'auto' to avoid animation
      });
    }, 0);
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