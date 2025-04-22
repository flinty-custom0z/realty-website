'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from './Button';

interface AdminListingActionsProps {
  listingId: string;
  categorySlug: string; // Added categorySlug prop
}

export default function AdminListingActions({ listingId, categorySlug }: AdminListingActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Ошибка при удалении объявления');
      }
      
      // Redirect to the category page instead of admin listings
      router.push(`/listing-category/${categorySlug}`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Ошибка при удалении объявления');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Link
        href={`/admin/listings/${listingId}`}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
      >
        Редактировать
      </Link>
      <Link
        href={`/admin/listings/${listingId}/history`}
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
      >
        История
      </Link>
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="danger"
        className="px-3 py-1"
        loading={isDeleting}
      >
        {isDeleting ? 'Удаление...' : 'Удалить'}
      </Button>
    </div>
  );
}