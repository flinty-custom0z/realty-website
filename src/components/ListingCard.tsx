import Image from 'next/image';
import Link from 'next/link';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  district?: string;
  rooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  condition?: string;
  imagePath?: string;
  listingCode: string;
}

export default function ListingCard({
  id,
  title,
  price,
  district,
  rooms,
  area,
  floor,
  totalFloors,
  condition,
  imagePath,
  listingCode,
}: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`} className="block group">
      <div className="bg-white shadow rounded-md overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-48 bg-gray-200">
          {imagePath ? (
            <Image
              src={imagePath}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Нет фото
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-500">{title}</h3>
          
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