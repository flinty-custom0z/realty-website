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
        className="inline-flex items-center justify-center px-4 py-2 bg-[#4285F4] text-white rounded-[8px] text-sm font-medium hover:bg-[#3b78e7] transition-all duration-200 shadow-sm"
      >
        Редактировать
      </Link>
      <Link
        href={`/admin/listings/${listingId}/history`}
        className="inline-flex items-center justify-center px-4 py-2 bg-[#F5F5F5] text-[#505050] rounded-[8px] text-sm font-medium hover:bg-[#EAEAEA] transition-all duration-200 shadow-sm"
      >
        История
      </Link>
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="danger"
        loading={isDeleting}
      >
        {isDeleting ? 'Удаление...' : 'Удалить'}
      </Button>
      <Link
        href="/admin/listings"
        className="inline-flex items-center justify-center text-[#4285F4] text-sm font-medium hover:underline transition-colors duration-200"
      >
        <ArrowLeft size={16} className="mr-1" />
        Назад к списку
      </Link>
    </div>
  );
}