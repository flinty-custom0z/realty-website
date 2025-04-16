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
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при удалении объявления');
      }
      
      // Redirect to the category page instead of admin listings
      router.push(`/listing-category/${categorySlug}`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Ошибка при удалении объявления');
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="flex space-x-2">
      <Link 
        href={`/admin/listings/${listingId}`}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center"
      >
        <span className="mr-1">✏️</span> Редактировать
      </Link>
      
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:bg-red-300 flex items-center"
      >
        <span className="mr-1">🗑️</span> {isDeleting ? 'Удаление...' : 'Удалить'}
      </button>
    </div>
  );
}