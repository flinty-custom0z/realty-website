'use client';

import { useState, useEffect } from 'react';
import OptimizedPropertyImage from '@/components/OptimizedPropertyImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  detectUserContext, 
  getOptimizedImageSizes, 
  getOptimizedQuality, 
  shouldPrioritizeImage,
  optimizeAltText,
  preloadCriticalImages
} from '@/lib/utils/webVitals';

interface Image {
  id: string;
  path: string;
  isFeatured?: boolean;
}

interface ImageGalleryProps {
  images: Image[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userConfig, setUserConfig] = useState(() => detectUserContext());

  // Update user context on resize and connection changes
  useEffect(() => {
    const handleResize = () => {
      setUserConfig(detectUserContext());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Preload all gallery images for better UX
  useEffect(() => {
    if (images.length > 0) {
      const imagePaths = images.map(img => img.path);
      preloadCriticalImages(imagePaths, userConfig);
    }
  }, [images, userConfig]);
  
  // Navigate to previous image
  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  // Navigate to next image
  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // No images case
  if (images.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-gray-50 flex items-center justify-center text-gray-400 rounded-lg">
        Нет фото
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main image container */}
      <div className="relative w-full flex justify-center items-center mb-4 rounded-lg overflow-hidden bg-gray-50" style={{ maxHeight: '70vh' }}>
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-gray-800" />
            </button>
          </>
        )}
      
        {/* Main image */}
        <div className="relative w-full flex justify-center items-center" style={{ maxHeight: '70vh' }}>
          <OptimizedPropertyImage
            src={images[selectedImageIndex].path}
            alt={optimizeAltText(`${title} - фото ${selectedImageIndex + 1}`)}
            className="object-contain max-h-[70vh] w-auto h-auto mx-auto"
            sizes={getOptimizedImageSizes(userConfig)}
            quality={getOptimizedQuality(userConfig)}
            priority={shouldPrioritizeImage(selectedImageIndex, images[selectedImageIndex].isFeatured ?? false, userConfig)}
            fallbackSrc="/images/placeholder.png"
            sizeVariant={userConfig.isMobile ? 'medium' : 'large'}
            enableBlur={true}
            showLoadingIndicator={true}
          />
        </div>
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 text-sm rounded-full">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className={`relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all ${
                selectedImageIndex === index 
                  ? 'ring-2 ring-gray-800 ring-offset-1' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <OptimizedPropertyImage
                src={image.path}
                alt={optimizeAltText(`${title} - миниатюра ${index + 1}`)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 16vw, 100px"
                fallbackSrc="/images/placeholder.png"
                sizeVariant="thumb"
                quality={70}
                enableBlur={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}