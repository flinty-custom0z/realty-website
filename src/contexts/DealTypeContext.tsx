// src/contexts/DealTypeContext.tsx - Fixed version
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
  
  // Theme transition ref for smooth color changes
  const themeTransitionTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Load user preference on first client-side render
  useEffect(() => {
    const storedPreference = localStorage.getItem('preferred-deal-type');
    if (storedPreference === 'rent' || storedPreference === 'sale') {
      // Initialize with user's stored preference
      // This will be overridden by URL params if they exist
      setDealTypeState(storedPreference as DealType);
      
      // Set CSS class for theme
      document.body.classList.remove('deal-type-sale-theme', 'deal-type-rent-theme');
      document.body.classList.add(`deal-type-${storedPreference}-theme`);
    }
  }, []);
  
  // Sync state with URL on first load and URL changes
  useEffect(() => {
    const dealParam = searchParams?.get('deal');
    if (dealParam === 'rent') {
      setDealTypeState('rent');
      localStorage.setItem('preferred-deal-type', 'rent');
      
      // Set CSS class for theme
      document.body.classList.remove('deal-type-sale-theme');
      document.body.classList.add('deal-type-rent-theme');
      
      // Add data attribute for accessibility testing tools
      document.body.setAttribute('data-theme', 'rent');
    } else {
      setDealTypeState('sale');
      localStorage.setItem('preferred-deal-type', 'sale');
      
      // Set CSS class for theme
      document.body.classList.remove('deal-type-rent-theme');
      document.body.classList.add('deal-type-sale-theme');
      
      // Add data attribute for accessibility testing tools
      document.body.setAttribute('data-theme', 'sale');
    }
  }, [searchParams]);
  
  // Update URL when dealType changes
  const setDealType = (type: DealType) => {
    // Remember current scroll position
    scrollPositionRef.current = window.scrollY;
    
    const params = new URLSearchParams(searchParams?.toString());
    
    // 1. update "deal" param
    if (type === 'sale') {
      params.delete('deal');
      
      // Update theme immediately for better UX
      document.body.classList.remove('deal-type-rent-theme');
      document.body.classList.add('deal-type-sale-theme');
      document.body.setAttribute('data-theme', 'sale');
      
      // Save user preference
      localStorage.setItem('preferred-deal-type', 'sale');
    } else {
      params.set('deal', 'rent');
      
      // Update theme immediately for better UX
      document.body.classList.remove('deal-type-sale-theme');
      document.body.classList.add('deal-type-rent-theme');
      document.body.setAttribute('data-theme', 'rent');
      
      // Save user preference
      localStorage.setItem('preferred-deal-type', 'rent');
    }
    
    // 2. remove filters that belong only to the *previous* deal type
    //    (otherwise the request can return 0 rows)
    ['category', 'district', 'condition', 'rooms'].forEach((key) =>
      params.delete(key)
    );
    
    // Apply the state change immediately for a responsive UI
    setDealTypeState(type);
    
    // Cancel any existing theme transition timer
    if (themeTransitionTimer.current) {
      clearTimeout(themeTransitionTimer.current);
    }
    
    // Use scroll=false to prevent page jump
    router.push(`${pathname}?${params.toString()}`, { 
      scroll: false
    });
    
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