'use client';

import Link from 'next/link';
import ClientImage from '@/components/ClientImage';
import { formatPrice } from '@/lib/utils';
import { useDealType } from '@/contexts/DealTypeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, TouchEvent } from 'react';

interface ListingCardProps {
  id: string;
  propertyType?: {
    name: string;
    slug?: string;
  };
  price: number;
  district?: string | { id: string; name: string; slug: string };
  address?: string;
  rooms?: number;
  area?: number;
  imagePaths: string[];
  listingCode: string;
}

export default function ListingCard({
  id,
  propertyType,
  price,
  district,
  address,
  area,
  imagePaths,
}: ListingCardProps) {
  // For component styling, use the global context
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dealType: contextDealType } = useDealType();
  
  // Handle district display whether it's a string or object
  const districtName = typeof district === 'object' && district !== null 
    ? district.name 
    : district;

  // Calculate price per square meter if area is available
  const pricePerSquareMeter = area ? Math.round(price / area) : null;
  
  const [idx, setIdx] = useState(0);
  const next = () => setIdx(i => (i + 1) % imagePaths.length);
  const prev = () => setIdx(i => (i - 1 + imagePaths.length) % imagePaths.length);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  // Minimum distance required for a swipe (in pixels)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSwipe && imagePaths.length > 1) {
      if (distance > 0) {
        // Swiped left, go to next image
        next();
      } else {
        // Swiped right, go to previous image
        prev();
      }
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <Link href={`/listing/${id}`} className="block rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      {/* --- image wrapper --- */}
      <div 
        className="relative aspect-[4/3] overflow-hidden group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ClientImage
          src={imagePaths[idx] || '/placeholder.jpg'}
          alt={propertyType?.name ?? 'Listing'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        
        {/* Arrows - only visible on hover */}
        {imagePaths.length > 1 && (
          <>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); prev(); }}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center w-6 h-6 bg-black/40 text-white rounded-full z-20 opacity-40 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={14}/>
            </button>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); next(); }}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center w-6 h-6 bg-black/40 text-white rounded-full z-20 opacity-40 hover:opacity-70 transition-opacity"
            >
              <ChevronRight size={14}/>
            </button>
          </>
        )}
        
        {/* Dots indicator */}
        {imagePaths.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {imagePaths.map((_, dotIdx) => (
              <button 
                key={dotIdx}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(dotIdx); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  dotIdx === idx ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Перейти к фото ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* --- text block --- */}
      <div className="p-4 space-y-1">
        {/* title */}
        <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">
          {propertyType?.name ?? 'Квартира'}{area ? ` ${area} м²` : ''}
        </h3>
        {/* address */}
        <p className="text-xs text-gray-500 line-clamp-1">
          {districtName && `${districtName}, `}{address}
        </p>
        {/* price row */}
        <div className="pt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold">{formatPrice(price, false)} ₽</span>
          {pricePerSquareMeter && (
            <span className="text-xs text-gray-500">{formatPrice(pricePerSquareMeter, false)} ₽/м²</span>
          )}
        </div>
      </div>
    </Link>
  );
}