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
  
  useEffect(() => {
    // Reset states when src changes
    setImgSrc(src);
    setError(false);
    setIsLoading(true);
  }, [src]);
  
  const handleError = () => {
    console.log(`Image error loading: ${imgSrc}`);
    setError(true);
    
    // Try plural/singular alternatives first
    if (imgSrc.includes('apartment_')) {
      setImgSrc(imgSrc.replace('apartment_', 'apartments_'));
    } else if (imgSrc.includes('house_')) {
      setImgSrc(imgSrc.replace('house_', 'houses_'));
    } else {
      // Fall back to the provided fallback
    setImgSrc(fallbackSrc);
    }
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
        />
      )}
      
      {error && imgSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          {alt || 'Изображение недоступно'}
        </div>
      )}
    </>
  );
}