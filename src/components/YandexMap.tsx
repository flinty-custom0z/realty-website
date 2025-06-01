'use client';

import { useEffect, useRef, useState } from 'react';
import { useYandexMaps } from './YandexMapProvider';

// Add type declaration for ymaps - this will override the one in YandexMapProvider
declare global {
  interface Window {
    ymaps: {
      ready: (callback: () => void) => void;
      Map: new (element: HTMLElement, options: {
        center: [number, number];
        zoom: number;
      }, options2?: Record<string, unknown>) => {
        geoObjects: {
          add: (placemark: unknown) => void;
        };
        destroy: () => void;
      };
      Placemark: new (
        coordinates: [number, number],
        properties?: {
          balloonContent?: string;
          iconContent?: string;
        },
        options?: {
          preset?: string;
          iconLayout?: string;
          iconImageHref?: string;
          iconImageSize?: [number, number];
          iconImageOffset?: [number, number];
          draggable?: boolean;
        }
      ) => unknown;
      // Add any other required ymaps properties here
      GeoObject: unknown;
    };
  }
}

interface YandexMapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  markers?: Array<{
    id: string;
    coordinates: [number, number]; // [lat, lng]
    title?: string;
    description?: string;
    onClick?: () => void;
  }>;
  height?: string;
  className?: string;
  enableClustering?: boolean;
}

export default function YandexMap({
  center,
  zoom = 14,
  markers = [],
  height = '400px',
  className = '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enableClustering = false // Will be implemented in future updates
}: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // Using any type here because Yandex Maps API types are not available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<any>(null);
  const { isLoaded, hasError, errorMessage } = useYandexMaps();
  const [localError, setLocalError] = useState<string>('');
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    // Clean up function to destroy map instance when component unmounts
    return () => {
      if (mapInstance) {
        try {
          if (typeof mapInstance.destroy === 'function') {
            mapInstance.destroy();
          }
        } catch (error) {
          console.error('Error destroying map:', error);
        }
      }
    };
  }, [mapInstance]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInitialized) return;

    const initMap = () => {
      try {
        // Check if ymaps is defined
        if (typeof window.ymaps === 'undefined') {
          console.error('Yandex Maps API not loaded');
          setLocalError('API карт не загружен');
          return;
        }

        console.log('Initializing map with center:', center, 'zoom:', zoom);
        
        // Create map
        const map = new window.ymaps.Map(mapRef.current!, {
          center,
          zoom
        });

        // Add markers
        markers.forEach(marker => {
          const placemark = new window.ymaps.Placemark(
            marker.coordinates,
            {
              balloonContent: marker.title || 'Метка',
            },
            {
              preset: 'islands#blueDotIcon', // Default blue dot icon
              draggable: false
            }
          );

          if (marker.onClick) {
            // Type assertion to access events property
            (placemark as { events: { add: (event: string, callback: () => void) => void } })
              .events.add('click', marker.onClick);
          }

          map.geoObjects.add(placemark);
        });

        setMapInstance(map);
        setMapInitialized(true);
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing Yandex Map:', error);
        setLocalError(error instanceof Error ? error.message : 'Ошибка при инициализации карты');
      }
    };

    // Initialize map when ymaps is ready
    window.ymaps.ready(initMap);
  }, [isLoaded, center, zoom, markers, mapInitialized]);

  if (hasError || localError) {
    return (
      <div 
        className={`w-full flex items-center justify-center bg-gray-100 ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-gray-500">Не удалось загрузить карту</p>
          <p className="text-sm text-gray-400">{errorMessage || localError || 'Пожалуйста, попробуйте позже'}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`w-full ${className}`}
      style={{ height }}
    >
      {!mapInitialized && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <p className="text-gray-500">Загрузка карты...</p>
          </div>
        </div>
      )}
    </div>
  );
} 