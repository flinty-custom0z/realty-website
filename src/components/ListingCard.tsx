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
  rooms,
  area,
  floor,
  totalFloors,
  condition,
  imagePath,
  categoryName,
  showCategory = false,
  status,
  isNew,
  dealType = 'SALE',
}: ListingCardProps) {
  // For component styling, use the global context
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dealType: contextDealType } = useDealType();
  
  // Handle district display whether it's a string or object
  const districtName = typeof district === 'object' && district !== null 
    ? district.name 
    : district;
  
  return (
    <Link href={`/listing/${id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden transition-all duration-300 listing-card border border-gray-100 hover:border-gray-200 hover:shadow-md">
        <div className="relative w-full h-64">
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
              
              {/* Price overlay with accent border */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white text-gray-900 
                           rounded-md shadow-sm z-10 text-sm font-medium
                           border-l-4 deal-accent-border">
                {formatPrice(price)}{dealType === 'RENT' ? '/мес' : ''}
              </div>
              
              {/* Category badge */}
              {showCategory && categoryName && (
                <ImageOverlay type="category" position="top-left">
                  {categoryName}
                </ImageOverlay>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
              Нет фото
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 line-clamp-1">
            {propertyType?.name || 'Недвижимость'}
            {area && ` ${area} м²`}
          </h3>
          
          {address && (
            <div className="text-sm text-gray-500 mt-1 mb-3 line-clamp-1">{address}</div>
          )}
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            {districtName && (
              <div className="text-sm">
                <span className="text-gray-500">Район:</span> <span className="text-gray-700">{districtName}</span>
              </div>
            )}
            {rooms && (
              <div className="text-sm">
                <span className="text-gray-500">Комнат:</span> <span className="text-gray-700">{rooms}</span>
              </div>
            )}
            {area && (
              <div className="text-sm">
                <span className="text-gray-500">Площадь:</span> <span className="text-gray-700">{area} м²</span>
              </div>
            )}
            {floor && totalFloors && (
              <div className="text-sm">
                <span className="text-gray-500">Этаж:</span> <span className="text-gray-700">{floor}/{totalFloors}</span>
              </div>
            )}
            {condition && (
              <div className="text-sm col-span-2">
                <span className="text-gray-500">Состояние:</span> <span className="text-gray-700">{condition}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end items-center">
            {/* Removed listing code display */}
          </div>
        </div>
      </div>
    </Link>
  );
}