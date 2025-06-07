'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import ClientImage from '@/components/ClientImage';
import TruncatedCell from '@/components/ui/TruncatedCell';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/Button';
import { formatDate, formatPrice } from '@/lib/utils';

interface ListingCardCompactProps {
  id: string;
  propertyType?: {
    name: string;
  } | null;
  price: number;
  listingCode: string;
  status: string;
  category?: {
    name: string;
  } | null;
  district: string | { id: string; name: string; slug: string };
  address: string;
  dealType: string;
  dateAdded: string;
  images: {
    path: string;
  }[];
  houseArea?: number;
  city?: {
    name: string;
  } | null;
  onDelete: (id: string) => void;
}

export default function ListingCardCompact({
  id,
  propertyType,
  price,
  listingCode,
  status,
  category,
  district,
  address,
  dealType,
  dateAdded,
  images,
  houseArea,
  city,
  onDelete,
}: ListingCardCompactProps) {
  const [expanded, setExpanded] = useState(false);
  
  const toggleDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  // Handle district display whether it's a string or object
  const districtName = typeof district === 'object' && district !== null 
    ? district.name 
    : district;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-4 flex items-start">
        {/* Thumbnail */}
        <div className="relative w-[70px] h-[70px] bg-gray-50 rounded overflow-hidden border border-gray-100">
          {images && images[0] ? (
            <ClientImage
              src={images[0].path}
              alt={propertyType?.name || 'Объект недвижимости'}
              fill
              sizes="70px"
              className="object-cover"
              fallbackSrc="/images/placeholder.png"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              Нет фото
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-base">
                <Link 
                  href={`/listing/${id}`}
                  className="hover:deal-accent-text transition-colors duration-200 cursor-pointer"
                  target="_blank"
                >
                  <TruncatedCell text={`${propertyType?.name || 'Объект недвижимости'}${houseArea ? ` ${houseArea} м²` : ''}`} maxWidth={280} />
                </Link>
              </h3>
              
              <div className="mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                <div className="font-medium">{formatPrice(price)}</div>
                <div className="text-gray-600">{districtName}</div>
                {city && <div className="text-gray-600">{city.name}</div>}
                <span className="text-gray-500 text-xs">Код: {listingCode}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                <span className={`px-2 py-1 rounded-full text-xs ${dealType === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                  {dealType === 'SALE' ? 'Продажа' : 'Аренда'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(dateAdded)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expandable details section */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Категория:</span> <span className="text-gray-700">{category?.name || 'Не указана'}</span>
            </div>
            <div>
              <span className="text-gray-500">Адрес:</span> <span className="text-gray-700">{address}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer with actions */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDetails}
          icon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        >
          {expanded ? 'Свернуть' : 'Детали'}
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Edit2 size={14} />}
            onClick={() => window.location.href = `/admin/listings/${id}`}
          >
            Ред.
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={() => onDelete(id)}
          >
            Удал.
          </Button>
        </div>
      </div>
    </div>
  );
} 