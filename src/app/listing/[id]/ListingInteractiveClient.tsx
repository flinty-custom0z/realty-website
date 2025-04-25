'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

interface ListingInteractiveClientProps {
  listingId: string;
}

// Main component for admin action buttons
export default function ListingInteractiveClient({ listingId }: ListingInteractiveClientProps) {
  const router = useRouter();

  return (
    <div className="flex space-x-3">
      <Button 
        variant="primary" 
        className="shadow-sm"
        onClick={() => router.push(`/admin/listings/${listingId}`)}
      >
        Редактировать
      </Button>
      <Button 
        variant="secondary"
        className="shadow-sm"
        onClick={() => router.push(`/admin/listings/${listingId}/history`)}
      >
        История
      </Button>
    </div>
  );
}

// Danger zone component
function DangerZone({ listingId }: ListingInteractiveClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteListing = async () => {
    if (!confirm('Вы уверены, что хотите удалить это объявление? Это действие невозможно отменить.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Redirect to admin listings page after successful deletion
      router.push('/admin/listings');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Произошла ошибка при удалении объявления. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="bg-red-50 rounded-md p-6 border border-red-100 mb-6">
      <h2 className="text-lg font-medium text-red-700 mb-4">Опасная зона</h2>
      <p className="text-gray-700 mb-4">Удаление объявления приведет к полному удалению всех данных и не может быть отменено.</p>
      <Button 
        variant="danger"
        onClick={handleDeleteListing}
        disabled={isDeleting}
      >
        {isDeleting ? 'Удаление...' : 'Удалить объявление'}
      </Button>
    </section>
  );
}

// Attach the DangerZone as a property of the main component
ListingInteractiveClient.DangerZone = DangerZone; 