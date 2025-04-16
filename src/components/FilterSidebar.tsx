'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  categorySlug: string;
  minPrice?: number;
  maxPrice?: number;
  districts?: string[];
  rooms?: number[];
  conditions?: string[];
  categories?: Category[];
  searchQuery?: string;
}

export default function FilterSidebar({
  categorySlug,
  minPrice = 0,
  maxPrice = 30000000,
  districts = [],
  rooms = [1, 2, 3, 4, 5],
  conditions = ['Черновая', 'Предчистовая', 'Требуется ремонт', 'Частичный ремонт', 'Ремонт под ключ', 'Хорошее', 'Евроремонт'],
  categories = [],
  searchQuery = '',
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Initialize state with default values
  const [priceRange, setPriceRange] = useState({
    min: minPrice,
    max: maxPrice,
  });
  
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug);
  
  // Flag to track if filters are active
  const [filtersActive, setFiltersActive] = useState(false);
  
  // State for available districts
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  
  // Fetch available districts
  useEffect(() => {
    const fetchDistricts = async () => {
      setIsLoadingDistricts(true);
      try {
        const response = await fetch('/api/districts');
        if (response.ok) {
          const districts = await response.json();
          setAvailableDistricts(districts);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setIsLoadingDistricts(false);
      }
    };
    
    fetchDistricts();
  }, []);
  
  // Update state from URL params after component mounts
  useEffect(() => {
    if (searchParams) {
      const minPriceParam = searchParams.get('minPrice');
      const maxPriceParam = searchParams.get('maxPrice');
      const roomsParam = searchParams.getAll('rooms');
      const districtParam = searchParams.get('district');
      const conditionParam = searchParams.get('condition');
      const categoryParam = searchParams.get('category');
      
      // Update price range
      setPriceRange({
        min: minPriceParam ? parseInt(minPriceParam) : minPrice,
        max: maxPriceParam ? parseInt(maxPriceParam) : maxPrice,
      });
      
      // Update rooms - now supports multiple selections
      if (roomsParam.length > 0) {
        setSelectedRooms(roomsParam.map(r => parseInt(r)));
      } else {
        setSelectedRooms([]);
      }
      
      setSelectedDistrict(districtParam || '');
      setSelectedCondition(conditionParam || '');
      setSelectedCategory(categoryParam || categorySlug);
      
      // Determine if filters are active
      setFiltersActive(
        !!minPriceParam || 
        !!maxPriceParam || 
        roomsParam.length > 0 || 
        !!districtParam || 
        !!conditionParam
      );
    }
  }, [searchParams, categorySlug, minPrice, maxPrice]);
  
  const applyFilters = () => {
    // Build query params
    const params = new URLSearchParams();
    
    if (priceRange.min > minPrice) {
      params.append('minPrice', priceRange.min.toString());
    }
    
    if (priceRange.max < maxPrice) {
      params.append('maxPrice', priceRange.max.toString());
    }
    
    // Support multiple room selections
    selectedRooms.forEach(room => {
      params.append('rooms', room.toString());
    });
    
    if (selectedDistrict) {
      params.append('district', selectedDistrict);
    }
    
    if (selectedCondition) {
      params.append('condition', selectedCondition);
    }
    
    // Preserve search query if exists
    if (searchQuery) {
      params.append('q', searchQuery);
    } else if (searchParams && searchParams.get('q')) {
      params.append('q', searchParams.get('q') as string);
    }
    
    // Navigate based on context
    if (categorySlug === '' && selectedCategory) {
      if (selectedCategory !== 'all') {
        // Navigate to category page with filters
        router.push(`/listing-category/${selectedCategory}?${params.toString()}`);
      } else {
        // Navigate to search page with filters
        router.push(`/search?${params.toString()}`);
      }
    } else {
      // Navigate with filters to current category page
      router.push(`/listing-category/${categorySlug}?${params.toString()}`);
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Auto-apply filters when selections change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-apply if component has mounted and not the first render
      if (searchParams) {
        applyFilters();
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange, selectedRooms, selectedDistrict, selectedCondition, selectedCategory]);
  
  const handleRoomToggle = (room: number) => {
    // Toggle the room in the selection array
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter(r => r !== room));
    } else {
      setSelectedRooms([...selectedRooms, room]);
    }
  };
  
  const handleReset = () => {
    // Reset all filter values to default
    setPriceRange({ min: minPrice, max: maxPrice });
    setSelectedRooms([]);
    setSelectedDistrict('');
    setSelectedCondition('');
    
    // Preserve only the search query if it exists
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append('q', searchQuery);
    } else if (searchParams && searchParams.get('q')) {
      params.append('q', searchParams.get('q') as string);
    }
    
    // Redirect to appropriate page
    if (categorySlug) {
      router.push(`/listing-category/${categorySlug}?${params.toString()}`);
    } else {
      router.push(`/search?${params.toString()}`);
    }
  };
  
  // Back button - goes back to category page or home
  const handleBack = () => {
    if (categorySlug) {
      router.push(`/listing-category/${categorySlug}`);
    } else {
      router.push('/');
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Фильтры</h3>
    
        {/* Back button when filters or search are active */}
        {(filtersActive || searchQuery) && (
          <button
            type="button"
            onClick={handleBack}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <span className="mr-1">←</span> Вернуться
          </button>
        )}
      </div>
    
      <form onSubmit={handleSubmit}>
    {/* Category dropdown - Only show on search page */}
    {categorySlug === '' && categories.length > 0 && (
      <div className="mb-4">
      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
      Категория
      </label>
      <select
      id="category"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="w-full p-2 border rounded text-sm"
      >
      <option value="all">Все категории</option>
      {categories.map((category) => (
        <option key={category.id} value={category.slug}>
        {category.name}
        </option>
      ))}
      </select>
      </div>
    )}
    
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
    
        {/* Rooms (for apartments/houses) - multi-select enabled */}
    {(categorySlug === 'apartments' || categorySlug === 'houses' || categorySlug === '') && (
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
    )}
    
        {/* District Dropdown */}
    <div className="mb-4">
    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
    Район
    </label>
          {isLoadingDistricts ? (
            <div className="w-full p-2 text-gray-500 text-sm border rounded">
              Загрузка районов...
            </div>
          ) : (
            <select
    id="district"
    value={selectedDistrict}
    onChange={(e) => setSelectedDistrict(e.target.value)}
    className="w-full p-2 border rounded text-sm"
            >
              <option value="">Все районы</option>
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          )}
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
    
    {/* Reset button */}
    <button
    type="button"
    onClick={handleReset}
          className={`w-full mb-2 py-2 rounded transition ${
            filtersActive 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
    >
          {filtersActive ? 'Сбросить фильтры' : 'Очистить'}
    </button>
    </form>
    </div>
  );
}