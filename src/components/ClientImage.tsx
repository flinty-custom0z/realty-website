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
    // If the path starts with /images/, convert it to use our API route
    if (src.startsWith('/images/')) {
      const imagePath = src.substring(8); // Remove "/images/" prefix
      setImgSrc(`/api/image/${imagePath}`);
    } else {
    setImgSrc(src);
    }
    
    setError(false);
    setIsLoading(true);
  }, [src]);
  
  const handleError = () => {
    console.log(`Image error loading: ${imgSrc}`);
    
    // If fallback also starts with /images/, convert it
    if (fallbackSrc.startsWith('/images/')) {
      const fallbackPath = fallbackSrc.substring(8);
      setImgSrc(`/api/image/${fallbackPath}`);
    } else {
      setImgSrc(fallbackSrc);
    }
    
    setError(true);
  };
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gray-100 w-full h-full"></div>
        </div>
      )}
      
      {imgSrc && !error && (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
      sizes={sizes}
      priority={priority}
      onError={handleError}
          onLoad={handleLoad}
          unoptimized={true} // Skip Next.js image optimization to troubleshoot
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