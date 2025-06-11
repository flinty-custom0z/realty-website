'use client';

import React, { useState, useEffect } from 'react';

interface PriceInputProps {
  id: string;
  name: string;
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
  suffix?: string;
}

export default function PriceInput({
  id,
  name,
  value,
  onChange,
  required = false,
  className = '',
  placeholder = '',
  label,
  suffix
}: PriceInputProps) {
  // Store the formatted display value
  const [displayValue, setDisplayValue] = useState('');
  
  // Format the value for display
  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      setDisplayValue('');
    } else {
      // Convert to string, remove non-digits, then format with spaces
      const numericValue = value.toString().replace(/\D/g, '');
      if (numericValue) {
        setDisplayValue(formatWithSpaces(numericValue));
      } else {
        setDisplayValue('');
      }
    }
  }, [value]);
  
  // Format a numeric string with spaces between every 3 digits
  const formatWithSpaces = (numericString: string): string => {
    return numericString.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  
  // Remove spaces and non-numeric characters
  const parseNumericValue = (formattedValue: string): string => {
    return formattedValue.replace(/\D/g, '');
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = e.target.value;
    const numericValue = parseNumericValue(formattedValue);
    
    // Update the display value with proper formatting
    setDisplayValue(formatWithSpaces(numericValue));
    
    // Pass the numeric value to the parent component
    onChange(name, numericValue);
  };
  
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {suffix && `(${suffix})`} {required && '*'}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        id={id}
        value={displayValue}
        onChange={handleChange}
        className={`w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200 ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
} 