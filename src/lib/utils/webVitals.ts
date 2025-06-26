// Core Web Vitals optimization utilities for Russian mobile users

export interface ImageOptimizationConfig {
  isMobile: boolean;
  isRussian: boolean;
  connectionSpeed: 'slow' | 'fast' | 'unknown';
  viewportWidth: number;
}

// Detect Russian users and mobile devices
export function detectUserContext(): ImageOptimizationConfig {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isRussian: false,
      connectionSpeed: 'unknown',
      viewportWidth: 1200,
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Detect Russian users by language preference
  const language = navigator.language || (navigator as any).userLanguage;
  const isRussian = language.startsWith('ru') || 
                   navigator.languages?.some(lang => lang.startsWith('ru')) || 
                   false;

  // Detect connection speed
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  let connectionSpeed: 'slow' | 'fast' | 'unknown' = 'unknown';
  
  if (connection) {
    // Slow: 2G, slow-2g, or effective type 'slow-2g'/'2g'
    // Fast: 4G, 3G, or effective type '3g'/'4g'
    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
      connectionSpeed = 'slow';
    } else if (effectiveType === '3g' || effectiveType === '4g' || downlink >= 1) {
      connectionSpeed = 'fast';
    }
  }

  return {
    isMobile,
    isRussian,
    connectionSpeed,
    viewportWidth: window.innerWidth,
  };
}

// Generate optimized image sizes for Russian mobile users
export function getOptimizedImageSizes(config: ImageOptimizationConfig): string {
  const { isMobile, connectionSpeed, viewportWidth } = config;

  if (isMobile) {
    // Russian mobile users - prioritize speed
    if (connectionSpeed === 'slow') {
      return '(max-width: 480px) 80vw, (max-width: 768px) 90vw, 50vw';
    } else {
      return '(max-width: 480px) 100vw, (max-width: 768px) 100vw, 60vw';
    }
  }

  // Desktop sizes
  if (viewportWidth < 1200) {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw';
  }

  return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
}

// Get optimized quality based on user context
export function getOptimizedQuality(config: ImageOptimizationConfig): number {
  const { isMobile, connectionSpeed } = config;

  if (isMobile && connectionSpeed === 'slow') {
    return 75; // Lower quality for slow connections
  }

  if (isMobile) {
    return 80; // Balanced quality for mobile
  }

  return 85; // High quality for desktop
}

// Determine image priority for LCP optimization
export function shouldPrioritizeImage(
  imageIndex: number, 
  isFeatured: boolean, 
  config: ImageOptimizationConfig
): boolean {
  const { isMobile } = config;

  // Always prioritize the first image (hero image)
  if (imageIndex === 0) return true;

  // Prioritize featured images
  if (isFeatured) return true;

  // On mobile, only prioritize the first 2 images to avoid LCP issues
  if (isMobile && imageIndex < 2) return true;

  return false;
}

// Generate responsive image variants for API
export function getImageVariants(
  originalPath: string,
  config: ImageOptimizationConfig
): {
  thumb: string;
  medium: string;
  large: string;
  original: string;
} {
  const { isMobile, connectionSpeed } = config;
  
  const basePath = originalPath.startsWith('/images/') 
    ? `/api/image/${originalPath.substring(8)}`
    : `/api/image/${originalPath}`;

  // Adjust sizes based on user context
  const thumbSize = isMobile && connectionSpeed === 'slow' ? 150 : 200;
  const mediumSize = isMobile ? 500 : 600;
  const largeSize = isMobile ? 800 : 1200;

  return {
    thumb: `${basePath}?width=${thumbSize}&quality=70`,
    medium: `${basePath}?width=${mediumSize}&quality=${getOptimizedQuality(config)}`,
    large: `${basePath}?width=${largeSize}&quality=${getOptimizedQuality(config)}`,
    original: basePath,
  };
}

// Preload critical images for Russian users
export function preloadCriticalImages(imagePaths: string[], config: ImageOptimizationConfig): void {
  if (typeof window === 'undefined') return;

  const { isMobile, connectionSpeed } = config;
  
  // Don't preload on slow connections
  if (connectionSpeed === 'slow') return;

  // Limit preloading on mobile to avoid performance issues
  const maxPreload = isMobile ? 2 : 3;
  const imagesToPreload = imagePaths.slice(0, maxPreload);

  imagesToPreload.forEach((path, index) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    
    const variants = getImageVariants(path, config);
    link.href = isMobile ? variants.medium : variants.large;
    
    // Add responsive preload for mobile
    if (isMobile) {
      link.media = '(max-width: 768px)';
    }

    document.head.appendChild(link);

    // Clean up after a delay to avoid memory leaks
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 10000);
  });
}

// Russian-specific image alt text optimization
export function optimizeAltText(
  originalAlt: string,
  propertyType?: string,
  location?: string,
  price?: number
): string {
  let optimizedAlt = originalAlt;

  // Add property type in Russian if missing
  if (propertyType && !optimizedAlt.includes(propertyType)) {
    optimizedAlt = `${propertyType} ${optimizedAlt}`;
  }

  // Add location context for Russian SEO
  if (location && !optimizedAlt.includes(location)) {
    optimizedAlt = `${optimizedAlt} в ${location}`;
  }

  // Add price context for better accessibility
  if (price && !optimizedAlt.includes('₽')) {
    optimizedAlt = `${optimizedAlt} - ${price.toLocaleString('ru-RU')} ₽`;
  }

  return optimizedAlt.trim();
} 