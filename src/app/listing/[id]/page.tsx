'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ImageGallery from '@/components/ImageGallery';
import ClientImage from '@/components/ClientImage';
import Button from '@/components/Button';
import { ArrowLeft } from 'lucide-react';

// Create a component for the client-side data fetching
function ListingDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/404');
            return;
          }
          throw new Error('Failed to fetch listing');
        }
        
        const data = await res.json();
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError('Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListing();
  }, [id, router]);

  const handleDeleteListing = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Ошибка при удалении объявления');
      }
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Ошибка при удалении объявления');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Объявление не найдено'}</p>
          <Link href="/" className="text-red-600 underline mt-2 inline-block">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const dateAdded = new Date(listing.dateAdded).toLocaleDateString('ru-RU');
  
  // Ensure main image is first
  const sortedImages = listing.images.slice().sort((a: any, b: any) => {
    if (a.isFeatured === b.isFeatured) return 0;
    return a.isFeatured ? -1 : 1;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* top bar */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/" className="text-[#4285F4] hover:underline transition-all duration-200 flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          На главную
        </Link>
        <div className="flex space-x-3">
          <Button 
            variant="primary" 
            className="shadow-sm"
            onClick={() => router.push(`/admin/listings/${listing.id}`)}
          >
            Редактировать
          </Button>
          <Button 
            variant="secondary"
            className="shadow-sm"
            onClick={() => router.push(`/admin/listings/${listing.id}/history`)}
          >
            История
          </Button>
          <Button 
            variant="danger"
            onClick={handleDeleteListing}
          >
            Удалить
          </Button>
        </div>
      </div>
      
      {/* title & gallery */}
      <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
      <ImageGallery images={sortedImages} title={listing.title} />
      <p className="text-gray-500 mt-2 mb-6">Добавлено: {dateAdded}</p>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* left column */}
        <div className="w-full md:w-2/3">
          {/* characteristics */}
          <section className="bg-white shadow rounded-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Характеристики объекта</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                {listing.district && <p className="mb-2"><span className="text-gray-600">Район:</span> {listing.district}</p>}
                {listing.address && <p className="mb-2"><span className="text-gray-600">Адрес:</span> {listing.address}</p>}
                {listing.rooms && <p className="mb-2"><span className="text-gray-600">Комнат:</span> {listing.rooms}</p>}
                {listing.floor && listing.totalFloors && 
                  <p className="mb-2"><span className="text-gray-600">Этаж:</span> {listing.floor}/{listing.totalFloors}</p>
                }
                {listing.houseArea && <p className="mb-2"><span className="text-gray-600">Площадь (м²):</span> {listing.houseArea}</p>}
                {listing.landArea && <p className="mb-2"><span className="text-gray-600">Площадь участка (сот.):</span> {listing.landArea}</p>}
                <p className="mb-2"><span className="text-gray-600">Цена:</span> {listing.price.toLocaleString()} ₽</p>
              </div>
              <div>
                {listing.yearBuilt && <p className="mb-2"><span className="text-gray-600">Год:</span> {listing.yearBuilt}</p>}
                {listing.condition && <p className="mb-2"><span className="text-gray-600">Состояние:</span> {listing.condition}</p>}
                <p className="mb-2"><span className="text-gray-600">Код объекта:</span> {listing.listingCode}</p>
                <p className="mb-2"><span className="text-gray-600">Дата добавления:</span> {dateAdded}</p>
              </div>
            </div>
          </section>
          
          {/* public description */}
          {listing.publicDescription && (
            <section className="bg-white shadow rounded-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Описание</h2>
              <div className="prose max-w-none text-gray-800">
                {listing.publicDescription.split('\n').map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}
          
          {/* admin comment */}
          {listing.adminComment && (
            <section className="bg-white shadow rounded-md p-6 mb-6 border-l-4 border-blue-500">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🔒</span> Комментарий администратора
              </h2>
              <div className="prose max-w-none text-gray-700">
                {listing.adminComment.split('\n').map((p: string, i: number) => (
                  <p key={i} className="mb-4">
                    {p}
                  </p>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 italic">
                Этот комментарий виден только администраторам
              </p>
            </section>
          )}
        </div>
        
        {/* right sidebar */}
        <aside className="w-full md:w-1/3">
          <div className="bg-white shadow rounded-md p-6 sticky top-4">
            <div className="flex items-center mb-4">
              {listing.user.photo && (
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <ClientImage
                    src={`/api/image${listing.user.photo}`}
                    alt={`Фото ${listing.user.name}`}
                    className="w-full h-full object-cover"
                    width={64}
                    height={64}
                  />
                </div>
              )}
              <div>
                <h3 className="font-bold">{listing.user.name}</h3>
                <p className="text-gray-600">Риелтор</p>
              </div>
            </div>
            <div className="border-t pt-4 text-sm">
              <p className="mb-2 flex items-center">
                <span className="mr-2">📱</span>
                <a href={`tel:${listing.user.phone}`} className="text-blue-500 hover:underline">
                  {listing.user.phone}
                </a>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// This is the main page component
export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return <ListingDetailClient id={params.id} />;
}
