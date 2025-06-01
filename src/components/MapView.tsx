'use client';

import { useState } from 'react';
import YandexMap from './YandexMap';
import YandexMapProvider from './YandexMapProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MapListing {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
  address: string | null;
  propertyType: { name: string } | null;
  images: { path: string }[];
}

interface MapViewProps {
  listings: MapListing[];
}

export default function MapView({ listings }: MapViewProps) {
  const router = useRouter();
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null);

  // Calculate map center based on all listings - with proper tuple typing
  const center = listings.length > 0
    ? [
        listings.reduce((sum, l) => sum + l.latitude, 0) / listings.length,
        listings.reduce((sum, l) => sum + l.longitude, 0) / listings.length
      ] as [number, number] // Assert as tuple
    : [45.035470, 38.975313] as [number, number]; // Default to Krasnodar center

  const markers = listings.map(listing => ({
    id: listing.id,
    coordinates: [listing.latitude, listing.longitude] as [number, number],
    title: listing.propertyType?.name || 'Объект',
    description: formatPrice(listing.price),
    onClick: () => setSelectedListing(listing)
  }));

  // Format price with spaces as thousand separators
  function formatPrice(price: number): string {
    return `${price.toLocaleString('ru-RU')} ₽`;
  }

  return (
    <div className="relative h-full min-h-[calc(100vh-120px)]">
      <YandexMapProvider>
        <YandexMap
          center={center}
          zoom={12}
          markers={markers}
          height="100%"
          enableClustering={listings.length > 50}
        />
      </YandexMapProvider>
      
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg p-4">
          <button
            onClick={() => setSelectedListing(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          
          <div className="flex gap-4">
            {selectedListing.images[0] && (
              <div className="relative w-24 h-24 overflow-hidden rounded">
                <Image
                  src={selectedListing.images[0].path}
                  alt={selectedListing.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{selectedListing.title}</h3>
              <p className="text-gray-600 text-sm">{selectedListing.address}</p>
              <p className="text-xl font-bold text-blue-600 mt-2">
                {formatPrice(selectedListing.price)}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.push(`/listing/${selectedListing.id}`)}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Подробнее
          </button>
        </div>
      )}
    </div>
  );
} 