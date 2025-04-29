'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import ClientImage from '@/components/ClientImage';
import { Loader2, Eye, X, Upload } from 'lucide-react';
import Button from './Button';

interface ImagePreview {
  file: File;
  url: string;
  id: string;
}

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  onImageRemoved: (index: number) => void;
  isUploading: boolean;
  uploadingImages?: Record<string, boolean>;
  previewModalHandler?: (url: string) => void;
}

export default function ImageUpload({
  onImagesSelected,
  onImageRemoved,
  isUploading,
  uploadingImages = {},
  previewModalHandler
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    let errorCount = 0;
    const validImages: File[] = [];
    const validImagePreviews: ImagePreview[] = [];
    
    // Allowed image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    // Max file size (5MB)
    const maxFileSize = 5 * 1024 * 1024;
    
    Array.from(e.target.files).forEach(file => {
      // Validate file type and size
      if (!allowedTypes.includes(file.type)) {
        console.error(`Invalid file type: ${file.type} for ${file.name}`);
        errorCount++;
        return;
      }
      
      if (file.size > maxFileSize) {
        console.error(`File too large: ${file.name} (${Math.round(file.size / 1024)}KB)`);
        errorCount++;
        return;
      }
      
      // Add valid file to array
      validImages.push(file);
      
      // Create preview for valid file
      validImagePreviews.push({
        file,
        url: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      });
    });
    
    // Show error message if any files were invalid
    if (errorCount > 0) {
      setErrorMessage(
        `${errorCount} ${errorCount === 1 ? 'файл был отклонен' : 'файлов было отклонено'}. Разрешены только изображения JPG, PNG или WebP до 5MB.`
      );
    }
    
    // Only process valid files
    if (validImages.length > 0) {
      setPreviews((prev) => [...prev, ...validImagePreviews]);
      onImagesSelected(validImages);
    }
    
    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previews[index].url);
    
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onImageRemoved(index);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      let errorCount = 0;
      const validImages: File[] = [];
      const validImagePreviews: ImagePreview[] = [];
      
      // Allowed image types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      // Max file size (5MB)
      const maxFileSize = 5 * 1024 * 1024;
      
      Array.from(e.dataTransfer.files).forEach(file => {
        // Validate file type and size
        if (!allowedTypes.includes(file.type)) {
          console.error(`Invalid file type: ${file.type} for ${file.name}`);
          errorCount++;
          return;
        }
        
        if (file.size > maxFileSize) {
          console.error(`File too large: ${file.name} (${Math.round(file.size / 1024)}KB)`);
          errorCount++;
          return;
        }
        
        // Add valid file to array
        validImages.push(file);
        
        // Create preview for valid file
        validImagePreviews.push({
          file,
          url: URL.createObjectURL(file),
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        });
      });
      
      // Show error message if any files were invalid
      if (errorCount > 0) {
        setErrorMessage(
          `${errorCount} ${errorCount === 1 ? 'файл был отклонен' : 'файлов было отклонено'}. Разрешены только изображения JPG, PNG или WebP до 5MB.`
        );
      }
      
      // Only process valid files
      if (validImages.length > 0) {
        setPreviews((prev) => [...prev, ...validImagePreviews]);
        onImagesSelected(validImages);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`file-upload-area ${
          isDragging ? 'border-[#11535F] bg-blue-50' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="file-upload"
        />
        <div className="flex flex-col items-center space-y-2">
          <Upload size={32} className={`${isDragging ? 'text-[#11535F]' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-500">Перетащите файлы сюда или</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="admin-add-btn mt-2"
            type="button"
          >
            Выбрать файлы
          </button>
          <p className="text-xs text-gray-500 mt-2">Поддерживаются JPG, PNG и WebP до 5 МБ</p>
        </div>
      </div>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}
      
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => {
            const isCurrentlyUploading = isUploading && uploadingImages[preview.id];
            
            return (
              <div key={preview.id} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                <div className="relative h-full w-full">
                  <ClientImage
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    showLoadingIndicator={true}
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-[#11535F] text-white text-xs py-1 px-2 rounded-md z-10">
                      Главное фото
                    </div>
                  )}
                  {isCurrentlyUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
                      <Loader2 className="animate-spin text-white" size={24} />
                    </div>
                  )}
                </div>
           
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                  
                  {previewModalHandler && (
                    <button
                      type="button"
                      onClick={() => previewModalHandler(preview.url)}
                      className="bg-white text-[#11535F] rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      aria-label="Preview image"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 