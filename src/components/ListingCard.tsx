'use client';

import Link from 'next/link';
import ClientImage from '@/components/ClientImage';
import ImageOverlay from '@/components/ui/ImageOverlay';
import { formatPrice } from '@/lib/utils';
import { useDealType } from '@/contexts/DealTypeContext';

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
  floor?: number;
  totalFloors?: number;
  condition?: string;
  imagePath?: string;
  listingCode: string;
  categoryName?: string;
  showCategory?: boolean;
  status?: 'active' | 'inactive';
  isNew?: boolean;
  dealType?: 'SALE' | 'RENT';
}

export default function ListingCard({
  id,
  propertyType,
  price,
  district,
  address,
  area,
  imagePath,
  categoryName,
  showCategory = false,
  status,
  isNew,
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
  
  return (
    <Link href={`/listing/${id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden transition-all duration-300 listing-card border border-gray-100 hover:border-gray-200 hover:shadow-md">
        <div className="relative w-full h-44">
          {imagePath ? (
            <div className="relative w-full h-full overflow-hidden">
              <ClientImage
                src={imagePath}
                alt={propertyType?.name || 'Недвижимость'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fallbackSrc="/images/placeholder.png"
              />
              
              {/* Status overlay badges with improved visibility */}
              {status === 'inactive' && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="text-white text-sm font-medium px-3 py-1 rounded-md bg-black bg-opacity-60 shadow-sm border border-white border-opacity-20">
                    Неактивно
                  </span>
                </div>
              )}
              
              {/* New badge */}
              {isNew && (
                <ImageOverlay type="new" position="top-right">
                  Новое
                </ImageOverlay>
              )}
              
              {/* Category badge */}
              {showCategory && categoryName && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-medium rounded-md">
                  {categoryName}
                </div>
              )}
              
              {/* Image counter overlay (1/5) */}
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-md">
                1/5
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
              Нет фото
            </div>
          )}
        </div>
        
        <div className="p-4">
          {/* Title with property type and area */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 line-clamp-1">
            {propertyType?.name || 'Недвижимость'}{area ? ` ${area} м²` : ''}
          </h3>
          
          {/* Address with district */}
          <div className="text-sm text-gray-600 mt-1 mb-4 line-clamp-1">
            {districtName && <span>{districtName}</span>}
            {address && districtName && <span>, </span>}
            {address && <span>{address}</span>}
          </div>
          
          {/* Price display */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-baseline">
              <div className="text-xl font-bold">
                {formatPrice(price, false)} ₽
              </div>
              {pricePerSquareMeter && (
                <div className="text-xs text-gray-500">
                  {formatPrice(pricePerSquareMeter, false)} ₽/м²
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}