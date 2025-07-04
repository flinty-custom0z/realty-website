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
  quality?: number;
  sizeVariant?: 'thumb' | 'medium' | 'large' | 'original';
}

// Helper function to generate variant path without importing ImageService
function getImageVariantPath(originalPath: string, size: string): string {
  if (!originalPath) return '';
  
  const directory = originalPath.substring(0, originalPath.lastIndexOf('/'));
  const filename = originalPath.substring(originalPath.lastIndexOf('/') + 1);
  const filenameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  
  return `${directory}/${filenameWithoutExt}-${size}.webp`;
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
  quality = 80,
  sizeVariant = 'original',
}: ClientImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Handle both /images/ and /uploads/ paths by routing them through the API
    if (src.startsWith('/images/') || src.startsWith('/uploads/')) {
      // Remove the leading directory prefix to get the relative path
      const imagePath = src.startsWith('/images/') 
        ? src.substring(8)  // Remove "/images/" prefix
        : src.substring(9); // Remove "/uploads/" prefix
      
      // Check if we need a specific size variant
      if (sizeVariant !== 'original') {
        // First check if a pre-generated thumbnail would be appropriate
        const originalFilename = src.split('/').pop() || '';
        const filenameParts = originalFilename.split('.');
        
        // If filename has extension and appears to be a UUID-based filename
        if (filenameParts.length > 1 && /^[a-f0-9-]{36}\.[a-z]{3,4}$/i.test(originalFilename)) {
          // Use the pregenerated thumbnail variant if available
          const variantPath = getImageVariantPath(src, sizeVariant);
          // Route the variant through the API as well
          const variantImagePath = variantPath.startsWith('/images/') 
            ? variantPath.substring(8)
            : variantPath.startsWith('/uploads/')
            ? variantPath.substring(9)
            : variantPath;
          setImgSrc(`/api/image/${variantImagePath}`);
        } else {
          // For non-standard image paths or older uploads, use the dynamic API with params
          const maxWidth = sizeVariant === 'thumb' ? 200 : sizeVariant === 'medium' ? 600 : 1200;
          const apiPath = `/api/image/${imagePath}?width=${maxWidth}&quality=${quality}`;
          setImgSrc(apiPath);
        }
      } else {
        // Use original image through the API
        const apiPath = `/api/image/${imagePath}`;
        setImgSrc(apiPath);
      }
    } else if (src.startsWith('http')) {
      setImgSrc(src);
    } else {
      setImgSrc(src);
    }
    
    setError(false);
    setIsLoading(true);
  }, [src, sizeVariant, quality]);
  
  const handleError = () => {
    // If fallback also starts with /images/ or /uploads/, convert it
    if (fallbackSrc.startsWith('/images/')) {
      const fallbackPath = fallbackSrc.substring(8);
      setImgSrc(`/api/image/${fallbackPath}`);
    } else if (fallbackSrc.startsWith('/uploads/')) {
      const fallbackPath = fallbackSrc.substring(9);
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
    quality: quality,
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