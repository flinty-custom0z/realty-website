'use client';

import React, { useEffect, useState } from 'react';
import { useDealType } from '@/contexts/DealTypeContext';

interface ThemeTransitionProps {
  children: React.ReactNode;
  className?: string;
  themeProperty?: 'bg' | 'text' | 'border' | 'ring' | 'fill' | 'stroke';
  intensity?: 'light' | 'medium' | 'strong';
}

const intensityMap = {
  'bg': {
    light: 'bg-opacity-10',
    medium: 'bg-opacity-50',
    strong: '' // Full opacity
  },
  'text': {
    light: 'text-opacity-60',
    medium: 'text-opacity-80',
    strong: '' // Full opacity
  },
  'border': {
    light: 'border-opacity-20',
    medium: 'border-opacity-50',
    strong: 'border-opacity-100'
  },
  'ring': {
    light: 'ring-opacity-20',
    medium: 'ring-opacity-50',
    strong: 'ring-opacity-100'
  }
}

export default function ThemeTransition({ 
  children, 
  className = '',
  themeProperty = 'bg',
  intensity = 'strong'
}: ThemeTransitionProps) {
  const { dealType } = useDealType();
  const [themeClass, setThemeClass] = useState('');
  
  useEffect(() => {
    // Determine base class based on property and deal type
    const baseClass = `${themeProperty}-${dealType === 'sale' ? 'sale-primary-500' : 'rent-primary-500'}`;
    
    // Add intensity modifier if applicable
    const intensityClass = intensityMap[themeProperty]?.[intensity] || '';
    
    setThemeClass(`${baseClass} ${intensityClass}`);
  }, [dealType, themeProperty, intensity]);

  return (
    <div className={`transition-all duration-300 ease-in-out ${themeClass} ${className}`}>
      {children}
    </div>
  );
} 