'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  categorySlug: string;
  categories?: Category[];
  searchQuery?: string;
}

export default function FilterSidebar({
  categorySlug,
  categories = [],
  searchQuery = '',
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // State for filters
  const [query, setQuery] = useState(searchQuery);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '0');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '30000000');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.getAll('category'));
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(searchParams.getAll('district'));
  const [selectedConditions, setSelectedConditions] = useState<string[]>(searchParams.getAll('condition'));

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  
  // Fetch districts, filtered by category
  useEffect(() => {
    const fetchDistricts = async () => {
      const url = categorySlug ? `/api/districts?category=${categorySlug}` : '/api/districts';
      const res = await fetch(url);
      if (res.ok) setAvailableDistricts(await res.json());
    };
    fetchDistricts();
  }, [categorySlug]);
  
  // Clear query on nav
  useEffect(() => {
    if (!pathname.startsWith('/search') && !pathname.startsWith('/listing-category/')) {
      setQuery('');
    }
  }, [pathname]);

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };
  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(district) ? prev.filter((d) => d !== district) : [...prev, district]
    );
  };
  const handleConditionToggle = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.append('q', query);
    params.append('minPrice', minPrice);
    params.append('maxPrice', maxPrice);
    selectedCategories.forEach((c) => params.append('category', c));
    selectedDistricts.forEach((d) => params.append('district', d));
    selectedConditions.forEach((c) => params.append('condition', c));

    const base = categorySlug ? `/listing-category/${categorySlug}` : '/search';
    router.push(`${base}?${params.toString()}`);
  };
  
  return (
    <div className="p-4 bg-white shadow rounded-md mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Free-text search */}
        <div>
          <label className="block text-sm font-medium mb-1">Поиск</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ваш запрос"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Multi-category (general search only) */}
        {categorySlug === '' && (
          <div>
            <label className="block text-sm font-medium mb-1">Категории</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
          <button
                  key={cat.slug}
            type="button"
                  onClick={() => handleCategoryToggle(cat.slug)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    selectedCategories.includes(cat.slug)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
          >
                  {cat.name}
          </button>
              ))}
      </div>
      </div>
    )}
    
        {/* Price Range */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Мин. цена</label>
    <input
    type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Макс. цена</label>
    <input
    type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full p-2 border rounded"
    />
    </div>
    </div>
    
        {/* Multi-district */}
        <div>
          <label className="block text-sm font-medium mb-1">Районы</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
            {availableDistricts.map((dist) => (
        <button
                key={dist}
        type="button"
                onClick={() => handleDistrictToggle(dist)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedDistricts.includes(dist)
          ? 'bg-blue-500 text-white border-blue-500'
          : 'bg-white text-gray-700 border-gray-300'
        }`}
        >
                {dist}
        </button>
      ))}
      </div>
      </div>
    
        {/* Multi-condition */}
        <div>
          <label className="block text-sm font-medium mb-1">Состояние</label>
          <div className="flex flex-wrap gap-2">
            {['Черновая','Предчистовая','Требуется ремонт','Частичный ремонт','Ремонт под ключ','Хорошее','Евроремонт'].map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => handleConditionToggle(cond)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  selectedConditions.includes(cond)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {cond}
              </button>
              ))}
    </div>
    </div>
    
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Применить фильтры
          </button>
    </form>
    </div>
  );
}