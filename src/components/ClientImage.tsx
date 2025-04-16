'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ClientImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

export default function ClientImage({
  src,
  alt,
  fill = false,
  className = '',
  sizes = '100vw',
  priority = false,
  fallbackSrc = '/images/placeholder.png',
}: ClientImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // Reset states when src changes
    setImgSrc(src);
    setError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [src]);
  
  const handleError = () => {
    console.log(`Image error loading: ${imgSrc}, retry count: ${retryCount}`);
    
    if (retryCount >= 3) {
      // After 3 retries, use fallback
      setImgSrc(fallbackSrc);
    setError(true);
      return;
    }
    
    // Add cache-busting query parameter
    const timestamp = new Date().getTime();
    
    // Try different approaches based on the current source
    if (imgSrc.includes('/images/')) {
      // For uploaded images, add cache busting
      if (!imgSrc.includes('?')) {
        setImgSrc(`${imgSrc}?t=${timestamp}`);
      } else if (imgSrc.includes('apartment_')) {
        // Try alternative naming pattern
      setImgSrc(imgSrc.replace('apartment_', 'apartments_'));
    } else if (imgSrc.includes('house_')) {
      setImgSrc(imgSrc.replace('house_', 'houses_'));
    } else {
        // Fall back to placeholder
        setImgSrc(`${fallbackSrc}?t=${timestamp}`);
      }
    } else {
      // For non-image paths or if everything fails, use fallback
      setImgSrc(`${fallbackSrc}?t=${timestamp}`);
    }
    
    // Increment retry counter
    setRetryCount(prev => prev + 1);
  };
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse bg-gray-200 w-full h-full"></div>
        </div>
      )}
      
      {imgSrc && (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
          onLoad={handleLoad}
          unoptimized={retryCount > 1} // Don't optimize after multiple retries
        />
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          {alt || 'Изображение недоступно'}
        </div>
      )}
    </>
  );
}