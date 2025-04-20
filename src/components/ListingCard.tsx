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
  categoryName?: string; // New prop to display category
  showCategory?: boolean; // Flag to determine if category should be shown
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
      <div className="bg-white shadow rounded-md overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative w-full h-64">
          {imagePath ? (
            <div className="relative w-full h-full">
              <ClientImage
              src={imagePath}
              alt={title}
              fill
                className="object-cover rounded-md"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              fallbackSrc="/images/placeholder.png"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
              Нет фото
            </div>
          )}
          
          {/* Category badge - only show when specified */}
          {showCategory && categoryName && (
            <div className="absolute top-2 left-2">
              <span className="bg-blue-500 text-white px-2 py-1 text-xs rounded-full">
                {categoryName}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-500">{title}</h3>
          {address && <div className="text-xs text-gray-500 mb-1 truncate">{address}</div>}
          <div className="mt-2 text-sm text-gray-600">
            {district && <p>Район: {district}</p>}
            {rooms && <p>Комнат: {rooms}</p>}
            {area && <p>Площадь: {area} м²</p>}
            {floor && totalFloors && <p>Этаж: {floor}/{totalFloors}</p>}
            {condition && <p>Состояние: {condition}</p>}
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <p className="text-lg font-bold text-gray-900">{price.toLocaleString()} ₽</p>
            <p className="text-xs text-gray-500">Код: {listingCode}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}