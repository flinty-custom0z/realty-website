'use client';

import dynamic from 'next/dynamic';
import YandexMapProvider from './YandexMapProvider';

// Dynamically import YandexMap to avoid SSR issues
const YandexMap = dynamic(() => import('@/components/YandexMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-md" />
});

interface ListingMapClientProps {
  longitude: number;
  latitude: number;
  propertyType?: string;
  listingId: string;
  fullAddress?: string;
}

export default function ListingMapClient({ 
  longitude, 
  latitude, 
  propertyType = 'Объект недвижимости',
  listingId,
  fullAddress
}: ListingMapClientProps) {
  // Check if coordinates are valid numbers
  const validLongitude = typeof longitude === 'number' && !isNaN(longitude);
  const validLatitude = typeof latitude === 'number' && !isNaN(latitude);
  
  // Default to Krasnodar center if coordinates are invalid
  const mapCenter: [number, number] = validLongitude && validLatitude 
    ? [latitude, longitude] 
    : [45.035470, 38.975313]; // Default to Krasnodar center
  
  return (
    <section className="bg-white shadow rounded-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Расположение</h2>
      <YandexMapProvider>
        <YandexMap
          center={mapCenter}
          zoom={16}
          markers={[{
            id: listingId,
            coordinates: mapCenter,
            title: propertyType
          }]}
          height="400px"
          className="rounded-md overflow-hidden"
        />
      </YandexMapProvider>
      {fullAddress && (
        <p className="mt-3 text-sm text-gray-600">{fullAddress}</p>
      )}
    </section>
  );
} 