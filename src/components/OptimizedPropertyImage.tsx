'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PropertyImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  quality?: number;
  sizeVariant?: 'thumb' | 'medium' | 'large' | 'original';
  fallbackSrc?: string;
  showLoadingIndicator?: boolean;
  enableBlur?: boolean;
}

// Generate a low-quality placeholder for blur effect
function generateBlurDataURL(width: number = 8, height: number = 6): string {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    // Fallback for SSR - a very simple gradient
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyrmrWOEWBBhX5Zv4EdFNy9XLCmYtolsFnqiBAi+VoFAi2VoFj86ReIEArkBWLNDFHSqlE';
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = width;
  canvas.height = height;
  
  // Create a gradient from light gray to slightly darker gray
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

export default function OptimizedPropertyImage({
  src,
  alt,
  priority = false,
  fill = false,
  width,
  height,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  sizeVariant = 'original',
  fallbackSrc = '/images/placeholder.png',
  showLoadingIndicator = false,
  enableBlur = true,
}: PropertyImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    // Process image source on mount - handle both /images/ and /uploads/ paths
    if (src.startsWith('/images/') || src.startsWith('/uploads/')) {
      // Remove the leading directory prefix to get the relative path
      const imagePath = src.startsWith('/images/') 
        ? src.substring(8)  // Remove "/images/" prefix
        : src.substring(9); // Remove "/uploads/" prefix
      
      if (sizeVariant !== 'original') {
        // Use optimized variants for better performance
        const maxWidth = sizeVariant === 'thumb' ? 200 : sizeVariant === 'medium' ? 600 : 1200;
        return `/api/image/${imagePath}?width=${maxWidth}&quality=${quality}`;
      }
      
      return `/api/image/${imagePath}`;
    }
    
    return src;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = () => {
    // Handle both /images/ and /uploads/ paths for fallback
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
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Russian mobile-optimized sizes
  const optimizedSizes = priority 
    ? '(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    : sizes;

  // Generate blur placeholder
  const blurDataURL = enableBlur ? generateBlurDataURL() : undefined;

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    sizes: optimizedSizes,
    priority,
    quality,
    onError: handleError,
    onLoad: handleLoad,
    ...(enableBlur && blurDataURL && {
      placeholder: 'blur' as const,
      blurDataURL,
    }),
  };

  return (
    <div className="relative w-full h-full">
      {fill ? (
        <Image
          {...imageProps}
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      ) : (
        <Image
          {...imageProps}
          width={width || 500}
          height={height || 300}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
      
      {/* Loading indicator optimized for mobile */}
      {showLoadingIndicator && isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={20} />
            <span className="text-xs text-gray-600 font-medium">Загрузка...</span>
          </div>
        </div>
      )}
      
      {/* Error state for mobile */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-500 text-center px-2">
            Изображение недоступно
          </span>
        </div>
      )}
    </div>
  );
} 