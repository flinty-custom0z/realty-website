'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ListingHistory from '@/components/ListingHistory';

export default function ListingHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [listingTitle, setListingTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const response = await fetch(`/api/admin/listings/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }
        const data = await response.json();
        setListingTitle(data.title);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке объявления');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <Link href="/admin/listings" className="text-red-600 underline mt-2 inline-block">
          Вернуться к списку объявлений
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">История изменений объявления</h1>
        <div className="flex gap-2">
          <Link
            href={`/admin/listings/${id}`}
            className="admin-back-btn"
          >
            Вернуться к объявлению
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          История для объявления: {listingTitle}
        </h3>
        
        <ListingHistory listingId={id} />
      </div>
    </div>
  );
} 