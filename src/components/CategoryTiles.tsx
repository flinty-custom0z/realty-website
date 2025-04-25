'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ClientImage from '@/components/ClientImage';
import { useDealType } from '@/contexts/DealTypeContext';
import { motion } from 'framer-motion';

// Map category slugs to their placeholder images - using both plural and singular for redundancy
const categoryImages = {
  'apartments': '/images/apartments_placeholder.png',
  'houses': '/images/houses_placeholder.png',
  'land': '/images/land_placeholder.png',
  'commercial': '/images/commercial_placeholder.png',
  // Singular backups
  'apartment': '/images/apartment_placeholder.png',
  'house': '/images/house_placeholder.png',
};

// Default fallback image if a specific category image is not found
const defaultPlaceholder = '/images/placeholder.png';

// Mapping for category icons (SVG paths)
const categoryIcons: Record<string, React.ReactNode> = {
  'apartments': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="2.2"/><path d="M14 13H26M14 19H26M14 25H26M14 31H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg></span>
  ),
  'houses': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 18V33a2 2 0 002 2h20a2 2 0 002-2V18" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M20 7L6 18h28L20 7z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><rect x="15" y="24" width="10" height="11" stroke="currentColor" strokeWidth="2.2"/></svg></span>
  ),
  'land': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="20,7 4,33 36,33" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M20 27h8M12 21h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg></span>
  ),
  'commercial': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="10" height="20" stroke="currentColor" strokeWidth="2.2"/><rect x="22" y="16" width="10" height="14" stroke="currentColor" strokeWidth="2.2"/><path d="M4 36h32" stroke="currentColor" strokeWidth="2.2"/></svg></span>
  ),
};

// Determine plural form based on the count
function getListingText(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'объявление';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'объявления';
  } else {
    return 'объявлений';
  }
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    listings: number;
  };
  saleCount?: number;
  rentCount?: number;
}

interface CategoryTilesProps {
  initialCategories?: Category[];
}

export default function CategoryTiles({ initialCategories = [] }: CategoryTilesProps) {
  const { dealType, isDealTypeRent } = useDealType();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  // Fetch categories if not provided
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    if (initialCategories.length === 0) {
      fetchCategories();
    }
  }, [initialCategories]);
  
  // Filter based on deal type (typically we show fewer categories for rent)
  const filteredCategories = isDealTypeRent
    ? categories.filter(category => ['apartments', 'commercial'].includes(category.slug))
    : categories.filter(category => category.slug !== 'industrial');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
      {filteredCategories.map((category: Category) => { 
        const imageSrc = categoryImages[category.slug as keyof typeof categoryImages] || 
          categoryImages[(category.slug.endsWith('s') ? category.slug.slice(0, -1) : category.slug + 's') as keyof typeof categoryImages] || 
          defaultPlaceholder;
        const icon = categoryIcons[category.slug] || categoryIcons['apartments'];
        const categoryBgClass = `category-${category.slug}`;
        
        // Generate link based on deal type
        const linkHref = dealType === 'sale' 
          ? `/listing-category/${category.slug}` 
          : `/listing-category/${category.slug}?deal=rent`;
          
        // Get count based on the deal type  
        const listingCount = isDealTypeRent
          ? (category.rentCount || 0)
          : (category.saleCount || category._count?.listings || 0);
        
        return (
          <motion.div
            key={`${dealType}-${category.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              href={linkHref}
              className={`category-card group ${categoryBgClass} deal-type-transition`}
              style={{ height: '220px' }}
            >
              {/* Background image with overlay */}
              <div className="absolute inset-0 w-full h-full z-0">
                <ClientImage
                  src={imageSrc}
                  alt={category.name}
                  fill
                  className="object-cover opacity-40"
                  priority
                  fallbackSrc={defaultPlaceholder}
                />
                
                {/* Add subtle overlay based on deal type */}
                <div className={`absolute inset-0 ${
                  isDealTypeRent 
                    ? 'bg-gradient-to-br from-green-500/10 to-transparent' 
                    : 'bg-gradient-to-br from-blue-500/10 to-transparent'
                }`}></div>
              </div>
              
              <div className="category-card-content">
                <div className="category-icon deal-type-transition" 
                     style={{ filter: `var(--deal-icon-filter)` }}>
                  {icon}
                </div>
                <div className="category-title">{category.name}</div>
                <div className="category-count">
                  {listingCount} {getListingText(listingCount)}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
} 