import Link from 'next/link';
import ClientImage from '@/components/ClientImage';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  district?: string;
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
}

export default function ListingCard({
  id,
  title,
  price,
  district,
  address,
  rooms,
  area,
  floor,
  totalFloors,
  condition,
  imagePath,
  listingCode,
  categoryName,
  showCategory = false,
}: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden transition-all duration-300 listing-card border border-gray-100 hover:border-gray-200">
        <div className="relative w-full h-64">
          {imagePath ? (
            <div className="relative w-full h-full overflow-hidden">
              <ClientImage
                src={imagePath}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fallbackSrc="/images/placeholder.png"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
              Нет фото
            </div>
          )}
          
          {/* Price badge */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-white px-3 py-1.5 text-sm font-medium text-gray-900 rounded-md shadow-sm">
              {price.toLocaleString()} ₽
            </span>
          </div>
          
          {/* Category badge */}
          {showCategory && categoryName && (
            <div className="absolute top-4 left-4">
              <span className="bg-gray-800 bg-opacity-75 text-white px-3 py-1 text-xs rounded-full">
                {categoryName}
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 line-clamp-1">{title}</h3>
          
          {address && <div className="text-sm text-gray-500 mt-1 mb-3 line-clamp-1">{address}</div>}
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            {district && (
              <div className="text-sm">
                <span className="text-gray-500">Район:</span> <span className="text-gray-700">{district}</span>
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
            <p className="text-xs text-gray-500">Код: {listingCode}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}