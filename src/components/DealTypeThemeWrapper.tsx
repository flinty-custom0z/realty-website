'use client';

import { useEffect } from 'react';
import { useDealType } from '@/contexts/DealTypeContext';

interface DealTypeThemeWrapperProps {
  children: React.ReactNode;
}

export default function DealTypeThemeWrapper({ children }: DealTypeThemeWrapperProps) {
  const { dealType } = useDealType();
  
  // Apply theme class to body element
  useEffect(() => {
    // Remove both theme classes first
    document.body.classList.remove('deal-type-sale-theme', 'deal-type-rent-theme');
    
    // Add the correct theme class
    document.body.classList.add(`deal-type-${dealType}-theme`);
    
    return () => {
      // Clean up on unmount
      document.body.classList.remove('deal-type-sale-theme', 'deal-type-rent-theme');
    };
  }, [dealType]);
  
  return <>{children}</>;
} 