'use client';

import { useState } from 'react';
import ClientImage from '@/components/ClientImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400">
        Нет фото
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main image container */}
      <div className="relative w-full aspect-[4/3] mb-4 rounded overflow-hidden">
        {/* Navigation buttons for desktop */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors hidden md:flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-gray-800" />
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors hidden md:flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight size={24} className="text-gray-800" />
            </button>
          </>
        )}
      
        {/* Main image */}
        <div className="relative h-full w-full">
          <ClientImage
            src={images[selectedImageIndex].path}
            alt={`${title} - фото ${selectedImageIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority={true}
            fallbackSrc="/images/placeholder.png"
          />
        </div>
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className={`relative aspect-square rounded overflow-hidden cursor-pointer transition-all border-2 ${
                selectedImageIndex === index ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <ClientImage
                src={image.path}
                alt={`${title} - миниатюра ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 16vw, 100px"
                fallbackSrc="/images/placeholder.png"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}