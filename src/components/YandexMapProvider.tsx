'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface YandexMapsContextType {
  isLoaded: boolean;
  hasError: boolean;
  errorMessage: string;
}

const YandexMapsContext = createContext<YandexMapsContextType>({
  isLoaded: false,
  hasError: false,
  errorMessage: '',
});

export const useYandexMaps = () => useContext(YandexMapsContext);

export default function YandexMapProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Yandex Maps API directly
  useEffect(() => {
    // Skip if already loaded or if we're not in the browser
    if (typeof window === 'undefined') return;
    if (window.ymaps) {
      setIsLoaded(true);
      return;
    }

    const loadYandexMaps = () => {
      const script = document.createElement('script');
      // API key is configured for Krasnodar region
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=eb9b11bc-f999-4571-b48f-e4f9a9eb3345&lang=ru_RU';
      script.async = true;
      
      script.onload = () => {
        console.log('Yandex Maps script loaded');
        
        // Check if ymaps is defined
        if (window.ymaps) {
          // Wait for the API to be ready
          window.ymaps.ready(() => {
            console.log('Yandex Maps API ready');
            setIsLoaded(true);
          });
        } else {
          console.error('ymaps is not defined after script load');
          setErrorMessage('API карт не определен после загрузки скрипта');
          setHasError(true);
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load Yandex Maps script');
        setErrorMessage('Не удалось загрузить скрипт API карт');
        setHasError(true);
      };
      
      document.head.appendChild(script);
    };

    loadYandexMaps();
    
    // Cleanup function
    return () => {
      // No cleanup needed for script tag
    };
  }, []);

  return (
    <YandexMapsContext.Provider value={{ isLoaded, hasError, errorMessage }}>
      {children}
    </YandexMapsContext.Provider>
  );
} 