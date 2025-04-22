'use client';

import { useState, useRef, ChangeEvent } from 'react';
import ClientImage from '@/components/ClientImage';
import { Loader2, Eye, X } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 text-sm text-gray-500"
        />
      </div>
      
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => {
            const isCurrentlyUploading = isUploading && uploadingImages[preview.id];
            
            return (
              <div key={preview.id} className="relative group aspect-square">
                <div className="relative h-full w-full">
                  <ClientImage
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    showLoadingIndicator={true}
                  />
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
                    className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                  
                  {previewModalHandler && (
                    <button
                      type="button"
                      onClick={() => previewModalHandler(preview.url)}
                      className="bg-white text-blue-500 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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