'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from './Button';
import { ArrowLeft, Edit, Clock, Trash2 } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="admin-btn-group">
        <Button 
          variant="primary"
          icon={<Edit size={16} />}
          onClick={() => router.push(`/admin/listings/${listingId}`)}
        >
          Редактировать
        </Button>
        
        <Button 
          variant="secondary"
          icon={<Clock size={16} />}
          onClick={() => router.push(`/admin/listings/${listingId}/history`)}
        >
          История
        </Button>
        
        <Button 
          variant="back"
          isBackButton
          onClick={() => router.push('/admin/listings')}
        >
          Назад к списку
        </Button>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button 
          variant="danger"
          icon={<Trash2 size={16} />}
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full justify-center"
        >
          {isDeleting ? 'Удаление...' : 'Удалить объявление'}
        </Button>
      </div>
    </div>
  );
}