'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ClientImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
  showLoadingIndicator?: boolean;
}

export default function ClientImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes = '100vw',
  priority = false,
  fallbackSrc = '/images/placeholder.png',
  showLoadingIndicator = false,
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
  
  // Ensure we have a properly defined image source before rendering
  if (!imgSrc && !error) {
    return null;
  }
  
  const imageProps = {
    src: imgSrc,
    alt,
    className,
    sizes,
    priority,
    onError: handleError,
    onLoad: handleLoad,
  };
  
  return (
    <div className="relative w-full h-full">
      {fill ? (
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <Image
          {...imageProps}
          width={width || 500}
          height={height || 300}
        />
      )}
      
      {showLoadingIndicator && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-60">
          <Loader2 className="animate-spin text-blue-500" size={24} />
        </div>
      )}
    </div>
  );
}