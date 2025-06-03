'use client';

import { useState } from 'react';
import ClientImage from '@/components/ClientImage';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
        <div className="relative w-full flex justify-center items-center cursor-pointer" style={{ maxHeight: '70vh' }} onClick={() => setIsModalOpen(true)}>
          <ClientImage
            src={images[selectedImageIndex].path}
            alt={`${title} - фото ${selectedImageIndex + 1}`}
            className="object-contain max-h-[70vh] w-auto h-auto mx-auto"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority={true}
            fallbackSrc="/images/placeholder.png"
            sizeVariant="medium"
          />
          
          {/* Zoom icon overlay */}
          <div className="absolute top-3 right-3 z-10 bg-white/80 p-2 rounded-full shadow-md">
            <ZoomIn size={18} className="text-gray-700" />
          </div>
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
              <ClientImage
                src={image.path}
                alt={`${title} - миниатюра ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 16vw, 100px"
                fallbackSrc="/images/placeholder.png"
                sizeVariant="thumb"
                quality={75}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button 
            className="absolute top-4 right-4 z-10 bg-white/20 p-2 rounded-full text-white hover:bg-white/30 transition-colors"
            onClick={() => setIsModalOpen(false)}
          >
            <X size={24} />
          </button>
          
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={30} className="text-white" />
              </button>
              
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={30} className="text-white" />
              </button>
            </>
          )}
          
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <ClientImage
              src={images[selectedImageIndex].path}
              alt={`${title} - фото ${selectedImageIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
              fallbackSrc="/images/placeholder.png"
              sizeVariant="large"
              priority={true}
            />
          </div>
          
          {/* Image counter in modal */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 text-sm rounded-full border border-white/20">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}