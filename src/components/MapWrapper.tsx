'use client';

import { Suspense } from 'react';
import MapPageClient from './MapPageClient';

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

interface MapWrapperProps {
  listings: MapListingData[];
}

export default function MapWrapper({ listings }: MapWrapperProps) {
  return (
    <div className="flex-1 h-full">
      <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse" />}>
        <MapPageClient listings={listings} />
      </Suspense>
    </div>
  );
} 