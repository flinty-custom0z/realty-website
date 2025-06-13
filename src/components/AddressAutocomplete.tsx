'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onSelect?: (data: {
    address: string;
    coordinates?: { lat: number; lng: number };
    fullAddress: string;
  }) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

interface Suggestion {
  title: string;
  subtitle: string;
  fullAddress: string;
  uri?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Начните вводить адрес...',
  className = '',
  error
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedAddress, setSelectedAddress] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedValue = useDebounce(value, 300);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedValue === selectedAddress) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (!debouncedValue || debouncedValue.length < 3) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const response = await fetch('/api/address/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: debouncedValue,
            // Center on Krasnodar [lat, lng]
            center: [45.035470, 38.975313]
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);

          const shouldOpen =
            document.activeElement === inputRef.current &&
            (data.suggestions?.length ?? 0) > 0;
          setIsOpen(shouldOpen);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue, selectedAddress]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, suggestions, selectedIndex]);

  const handleSelect = async (suggestion: Suggestion) => {
    onChange(suggestion.fullAddress);
    setSelectedAddress(suggestion.fullAddress);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onSelect && suggestion.uri) {
      // Geocode to get coordinates
      try {
        const response = await fetch('/api/address/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uri: suggestion.uri })
        });

        if (response.ok) {
          const data = await response.json();
          onSelect({
            address: suggestion.fullAddress,
            coordinates: data.coordinates,
            fullAddress: data.fullAddress
          });
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
        onSelect({
          address: suggestion.fullAddress,
          fullAddress: suggestion.fullAddress
        });
      }
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-900">{suggestion.title}</div>
              {suggestion.subtitle && (
                <div className="text-sm text-gray-500">{suggestion.subtitle}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 