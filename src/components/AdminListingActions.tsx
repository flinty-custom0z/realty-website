'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        <span className="mr-1">✏️</span> Редактировать
      </Link>
      <Link
        href={`/admin/listings/${listingId}/history`}
        className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
      >
        История
      </Link>
      <Link
        href={`/listing/${listingId}`}
        target="_blank"
        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
      >
        Просмотр
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
      >
        <span className="mr-1">🗑️</span> {isDeleting ? 'Удаление...' : 'Удалить'}
      </button>
    </div>
  );
}