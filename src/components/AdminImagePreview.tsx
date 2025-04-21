'use client';

import { useState } from 'react';
import ClientImage from '@/components/ClientImage';
import ImageModal from '@/components/ImageModal';
import { Eye } from 'lucide-react';

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
          relative group border-2 rounded p-1 aspect-square
          ${isSelected ? 'border-blue-500' : 'border-gray-200'}
          ${isMarkedForDeletion ? 'opacity-50' : ''}
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
        </div>
          
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDelete(image.id);
            }}
            className={`
              p-1 rounded-full w-7 h-7 flex items-center justify-center mb-2
              ${isMarkedForDeletion ? 'bg-red-500 text-white' : 'bg-white text-red-500 opacity-0 group-hover:opacity-100'}
              transition-opacity
            `}
            aria-label={isMarkedForDeletion ? "Отменить удаление" : "Удалить фото"}
          >
            {isMarkedForDeletion ? '↩' : '×'}
          </button>

          <button
            type="button"
            onClick={openModal}
            className="p-1 rounded-full w-7 h-7 flex items-center justify-center bg-white text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Просмотр фото"
          >
            <Eye size={16} />
          </button>
        </div>
        
        {isSelected && (
          <div className="absolute top-2 left-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
            Главное фото
          </div>
        )}
      </div>

      {isModalOpen && (
        <ImageModal
          src={image.path}
          alt="Фото объявления"
          onClose={closeModal}
        />
      )}
    </>
  );
}