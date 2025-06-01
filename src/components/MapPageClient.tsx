'use client';

import { Suspense } from 'react';
import MapView from './MapView';

// Define the type to match what comes from the database
interface MapListingData {
  id: string;
  title: string;
  price: number;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  propertyType: { name: string } | null;
  images: { path: string }[];
}

interface MapPageClientProps {
  listings: MapListingData[];
}

export default function MapPageClient({ listings }: MapPageClientProps) {
  // Filter out listings with null coordinates
  const validListings = listings.filter(
    (listing): listing is Omit<MapListingData, 'latitude' | 'longitude'> & { 
      latitude: number; 
      longitude: number;
    } => listing.latitude !== null && listing.longitude !== null
  );

  if (typeof window === 'undefined') {
    // Return a placeholder during server-side rendering
    return <div className="h-full bg-gray-100" />;
  }

  return (
    <div className="h-full">
      <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse" />}>
        <MapView listings={validListings} />
      </Suspense>
    </div>
  );
} 