'use client';

import React, { useCallback } from 'react';
import { Range } from 'react-range';
import { formatPriceInput, parsePriceInput } from '@/hooks/useFilterState';

export interface PriceRangeFilterProps {
  min: number;
  max: number;
  currentMin: number | null | undefined;
  currentMax: number | null | undefined;
  onChange: (min: number, max: number) => void;
  onInputChange?: (type: 'min' | 'max', value: string) => void;
  isLoading?: boolean;
}

export function PriceRangeFilter({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
  onInputChange,
  isLoading = false
}: PriceRangeFilterProps) {
  // Format inputs with proper separators
  const formattedMin = currentMin ? formatPriceInput(currentMin.toString()) : '';
  const formattedMax = currentMax ? formatPriceInput(currentMax.toString()) : '';
  
  // Handle input change
  const handleInputChange = useCallback((type: 'min' | 'max', value: string) => {
    if (onInputChange) {
      onInputChange(type, value);
    }
  }, [onInputChange]);
  
  // Calculate slider values, ensuring they're properly sorted
  const effectiveMin = Math.max(min, 0); // Ensure min is at least 0
  const effectiveMax = Math.max(max, effectiveMin + 10000); // Ensure max is greater than min
  
  const calculatedMinValue = currentMin != null && !isNaN(currentMin) 
    ? Math.max(Math.min(currentMin, effectiveMax), effectiveMin) 
    : effectiveMin;
  
  const calculatedMaxValue = currentMax != null && !isNaN(currentMax) 
    ? Math.max(Math.min(currentMax, effectiveMax), effectiveMin) 
    : effectiveMax;
  
  // Make sure the min is never greater than max (which would cause the React Range error)
  const sliderValues = calculatedMinValue > calculatedMaxValue 
    ? [calculatedMaxValue, calculatedMaxValue] // Both same value if min > max
    : [calculatedMinValue, calculatedMaxValue];
  
  return (
    <div className="filter-section mb-2">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Цена, ₽</h4>
      
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="price-input">
          <input
            type="text"
            inputMode="numeric"
            value={formattedMin}
            onChange={(e) => handleInputChange('min', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
            placeholder={effectiveMin.toLocaleString()}
          />
        </div>
        <div className="price-input">
          <input
            type="text"
            inputMode="numeric"
            value={formattedMax}
            onChange={(e) => handleInputChange('max', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
            placeholder={effectiveMax.toLocaleString()}
          />
        </div>
      </div>
      
      {/* Always render the slider container with a fixed height to prevent layout shifts */}
      <div className="px-1 py-2 h-[60px]">
        {(!isLoading || isLoading) && min !== undefined && max !== undefined && (
          <Range
            step={10000}
            min={effectiveMin}
            max={effectiveMax}
            values={sliderValues}
            onChange={([newMin, newMax]) => {
              // Snap to nearest 10,000 except for min and max
              const snap = (val: number, bound: number) => {
                if (val === bound) return val;
                return Math.round(val / 10000) * 10000;
              };
              
              const snappedMin = snap(newMin, effectiveMin);
              const snappedMax = snap(newMax, effectiveMax);
              
              onChange(snappedMin, snappedMax);
            }}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '4px',
                  background: '#e5e7eb',
                  borderRadius: '2px',
                  margin: '16px 0',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    height: '4px',
                    width: `${((sliderValues[1] - sliderValues[0]) / (effectiveMax - effectiveMin)) * 100}%`,
                    left: `${((sliderValues[0] - effectiveMin) / (effectiveMax - effectiveMin)) * 100}%`,
                    backgroundColor: 'var(--deal-accent-color)',
                    borderRadius: '2px',
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props }) => {
              // Destructure key and style, then spread the rest
              const { key, style, ...restThumbProps } = props;
              return (
                <div
                  key={key}
                  {...restThumbProps}
                  style={{
                    ...style,
                    height: '18px',
                    width: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--deal-accent-color)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    outline: 'none',
                  }}
                />
              );
            }}
          />
        )}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{effectiveMin.toLocaleString()} ₽</span>
          <span>{effectiveMax.toLocaleString()} ₽</span>
        </div>
      </div>
    </div>
  );
} 