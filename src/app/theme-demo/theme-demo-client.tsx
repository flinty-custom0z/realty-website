'use client';

import React from 'react';
import { useDealType } from '@/contexts/DealTypeContext';
import DealTypeToggle from '@/components/DealTypeToggle';
import { ThemeButton } from '@/components/ui/ThemeButton';
import StatusBadge from '@/components/ui/StatusBadge';
import ThemeTransition from '@/components/ui/ThemeTransition';
import ImageOverlay from '@/components/ui/ImageOverlay';
import { Home, Tag } from 'lucide-react';

export default function ThemeDemoClient() {
  const { dealType, setDealType } = useDealType();
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 deal-accent-text">Theme System Demo</h1>
      
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Deal Type Toggle</h2>
        <p className="mb-6 text-gray-600">
          Toggle between sale (blue) and rent (green) themes. Notice how all themed elements update.
        </p>
        <div className="flex space-x-4">
          <DealTypeToggle 
            current={dealType} 
            onChange={setDealType} 
            variant="default"
            counts={{ sale: 1240, rent: 680 }}
            showCounts={true}
          />
          
          <DealTypeToggle 
            current={dealType} 
            onChange={setDealType} 
            variant="sidebar"
          />
          
          <DealTypeToggle 
            current={dealType} 
            onChange={setDealType} 
            variant="nav"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <p className="mb-6 text-gray-600">
            Buttons automatically adapt to the current theme.
          </p>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <ThemeButton variant="default">Primary Button</ThemeButton>
              <ThemeButton variant="outline">Outline Button</ThemeButton>
              <ThemeButton variant="ghost">Ghost Button</ThemeButton>
              <ThemeButton variant="link">Link Button</ThemeButton>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <ThemeButton size="sm">Small Button</ThemeButton>
              <ThemeButton>Default Button</ThemeButton>
              <ThemeButton size="lg">Large Button</ThemeButton>
              <ThemeButton 
                size="icon" 
                icon={dealType === 'sale' ? <Home /> : <Tag />}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <ThemeButton disabled>Disabled Button</ThemeButton>
              <ThemeButton variant="outline" disabled>Disabled Outline</ThemeButton>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Status Indicators</h2>
          <p className="mb-6 text-gray-600">
            Status badges with proper contrast ratios and non-color indicators.
          </p>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="p-4 deal-accent-bg text-white rounded-md">
                Themed Background
              </div>
              <div className="p-4 border-2 deal-accent-border rounded-md">
                Themed Border
              </div>
              <div className="p-4 deal-accent-text font-medium">
                Themed Text
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Deal Type Indicators</h2>
        <p className="mb-6 text-gray-600">
          Properties display their deal type with both color and icon indicators.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative bg-gray-100 h-48 rounded-md overflow-hidden flex items-center justify-center">
            <ImageOverlay type="sale" position="bottom-right">For Sale</ImageOverlay>
            <span className="text-gray-400">[Property Image]</span>
          </div>
          
          <div className="relative bg-gray-100 h-48 rounded-md overflow-hidden flex items-center justify-center">
            <ImageOverlay type="rent" position="bottom-right">For Rent</ImageOverlay>
            <span className="text-gray-400">[Property Image]</span>
          </div>
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Theme Transition</h2>
        <p className="mb-6 text-gray-600">
          Elements can transition smoothly between themes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ThemeTransition themeProperty="bg" className="p-6 rounded-md text-white">
            Background Color
          </ThemeTransition>
          
          <ThemeTransition themeProperty="border" className="p-6 rounded-md border-2">
            Border Color
          </ThemeTransition>
          
          <ThemeTransition themeProperty="text" className="p-6 rounded-md bg-gray-100 font-medium">
            Text Color
          </ThemeTransition>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Typography with Theme Accents</h2>
        <div className="space-y-6">
          <div>
            <h3 className="deal-accent-text text-xl font-semibold mb-2">
              {dealType === 'sale' ? 'Property for Sale' : 'Property for Rent'}
            </h3>
            <p className="text-gray-600">
              This heading uses color to indicate the deal type, with sufficient contrast for accessibility.
            </p>
          </div>
          
          <div className="deal-section-highlight pl-4">
            <h3 className="text-xl font-semibold mb-2">Section with Theme Highlight</h3>
            <p className="text-gray-600">
              This section uses a subtle vertical bar in the theme color to indicate importance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 