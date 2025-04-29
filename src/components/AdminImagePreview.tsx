'use client';

import { useState } from 'react';
import ClientImage from '@/components/ClientImage';
import ImageModal from '@/components/ImageModal';
import { Eye, Trash2, Star } from 'lucide-react';

interface AdminImagePreviewProps {
  image: {
    id: string;
    path: string;
    isFeatured: boolean;
  };
  isSelected: boolean;
  isMarkedForDeletion: boolean;
  onToggleDelete: (id: string) => void;
  onSetFeatured: (id: string) => void;
}

export default function AdminImagePreview({
  image,
  isSelected,
  isMarkedForDeletion,
  onToggleDelete,
  onSetFeatured
}: AdminImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className={`
          relative group border-2 rounded-lg overflow-hidden aspect-square transition-all duration-200
          ${isSelected ? 'border-[#11535F] shadow-md' : 'border-gray-200'}
          ${isMarkedForDeletion ? 'opacity-50' : 'hover:shadow-md'}
        `}
        onClick={() => !isMarkedForDeletion && onSetFeatured(image.id)}
      >
        <div className="relative h-full w-full">
          <ClientImage
            src={image.path}
            alt="Listing image"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover rounded"
          />

          {isSelected && (
            <div className="absolute top-2 left-2 bg-[#11535F] text-white text-xs py-1 px-2 rounded-md z-10 flex items-center">
              <Star size={12} className="mr-1" />
              Главное фото
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDelete(image.id);
            }}
            className="bg-white text-red-600 hover:bg-red-50 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
            aria-label="Mark for deletion"
          >
            <Trash2 size={14} />
          </button>
          
          <button
            type="button"
            onClick={openModal}
            className="bg-white text-[#11535F] hover:bg-blue-50 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
            aria-label="Preview image"
          >
            <Eye size={14} />
          </button>
        </div>
        
        {isMarkedForDeletion && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs py-1 px-2 rounded-md">
              Будет удалено
            </span>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ImageModal
          src={image.path}
          alt="Просмотр изображения"
          onClose={closeModal}
        />
      )}
    </>
  );
}