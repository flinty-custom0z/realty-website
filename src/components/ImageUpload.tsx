'use client';

import { useState, useRef, ChangeEvent } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Create preview URLs and IDs
    const newPreviews = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }));
    
    setPreviews((prev) => [...prev, ...newPreviews]);
    onImagesSelected(newFiles);
    
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
      const newFiles = Array.from(e.dataTransfer.files);
      
      // Create preview URLs and IDs
      const newPreviews = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }));
      
      setPreviews((prev) => [...prev, ...newPreviews]);
      onImagesSelected(newFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`file-upload-area ${
          isDragging ? 'border-[#4285F4] bg-blue-50' : ''
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
          <Upload size={32} className={`${isDragging ? 'text-[#4285F4]' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-500">Перетащите файлы сюда или</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="admin-add-btn mt-2"
            type="button"
          >
            Выбрать файлы
          </button>
        </div>
      </div>
      
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
                    <div className="absolute top-2 left-2 bg-[#4285F4] text-white text-xs py-1 px-2 rounded-md z-10">
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
                      className="bg-white text-[#4285F4] rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
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