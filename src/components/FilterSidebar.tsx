'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSidebarProps {
  categorySlug: string;
  minPrice?: number;
  maxPrice?: number;
  districts?: string[];
  rooms?: number[];
  conditions?: string[];
}

export default function FilterSidebar({
  categorySlug,
  minPrice = 0,
  maxPrice = 30000000,
  districts = [],
  rooms = [1, 2, 3, 4, 5],
  conditions = ['Черновая', 'Предчистовая', 'Требуется ремонт', 'Частичный ремонт', 'Ремонт под ключ', 'Хорошее', 'Евроремонт'],
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') as string) : minPrice,
    max: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') as string) : maxPrice,
  });
  
  const [selectedRooms, setSelectedRooms] = useState<number[]>(
    searchParams.get('rooms') ? [parseInt(searchParams.get('rooms') as string)] : []
  );
  
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    searchParams.get('district') || ''
  );
  
  const [selectedCondition, setSelectedCondition] = useState<string>(
    searchParams.get('condition') || ''
  );
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    
    if (priceRange.min > minPrice) {
      params.append('minPrice', priceRange.min.toString());
    }
    
    if (priceRange.max < maxPrice) {
      params.append('maxPrice', priceRange.max.toString());
    }
    
    if (selectedRooms.length === 1) {
      params.append('rooms', selectedRooms[0].toString());
    }
    
    if (selectedDistrict) {
      params.append('district', selectedDistrict);
    }
    
    if (selectedCondition) {
      params.append('condition', selectedCondition);
    }
    
    // Preserve search query if exists
    if (searchParams.get('q')) {
      params.append('q', searchParams.get('q') as string);
    }
    
    // Navigate with filters
    router.push(`/listing-category/${categorySlug}?${params.toString()}`);
  };
  
  const handleRoomToggle = (room: number) => {
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter(r => r !== room));
    } else {
      setSelectedRooms([room]); // Only allow one selection
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium mb-4">Фильтры</h3>
      
      {/* Price range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="От"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded text-sm"
          />
          <input
            type="number"
            placeholder="До"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={100000}
          value={priceRange.min}
          onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
          className="w-full mt-2"
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={100000}
          value={priceRange.max}
          onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
      
      {/* Rooms (for apartments/houses) */}
      {categorySlug === 'apartments' || categorySlug === 'houses' ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Количество комнат</label>
          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <button
                key={room}
                type="button"
                onClick={() => handleRoomToggle(room)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedRooms.includes(room)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {room === 5 ? '5+' : room}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      
      {/* District */}
      <div className="mb-4">
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
          Район
        </label>
        <input
          type="text"
          id="district"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          placeholder="Введите район"
          className="w-full p-2 border rounded text-sm"
        />
      </div>
      
      {/* Condition */}
      <div className="mb-4">
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
          Состояние
        </label>
        <select
          id="condition"
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">Любое</option>
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Фильтровать
      </button>
    </form>
  );
}