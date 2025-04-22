'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from './Button';
import { ArrowLeft } from 'lucide-react';

interface AdminListingActionsProps {
  listingId: string;
  categorySlug: string;
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
    <div className="flex items-center space-x-3">
      <Link
        href={`/admin/listings/${listingId}`}
        className="admin-add-btn"
      >
        Редактировать
      </Link>
      <Link
        href={`/admin/listings/${listingId}/history`}
        className="admin-secondary-btn"
      >
        История
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="admin-delete-btn"
      >
        {isDeleting ? 'Удаление...' : 'Удалить'}
      </button>
      <Link
        href="/admin/listings"
        className="admin-back-btn"
      >
        <ArrowLeft size={16} />
        Назад к списку
      </Link>
    </div>
  );
}