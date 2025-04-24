'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ImageGallery from '@/components/ImageGallery';
import ClientImage from '@/components/ClientImage';
import Button from '@/components/Button';
import { ArrowLeft, Phone, Calendar, Hash, Share2, MapPin, User, AlertTriangle } from 'lucide-react';
import { formatPhoneNumber, formatDate, formatPrice } from '@/lib/utils';

// Create a component for the client-side data fetching
function ListingDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    // Check if current user is admin
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        setIsAdmin(data.isAuthenticated && data.user.role === 'ADMIN');
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, []);

  const handleDeleteListing = async () => {
    if (!confirm('Вы уверены, что хотите удалить это объявление? Это действие невозможно отменить.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
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

  const formattedDate = formatDate(listing.dateAdded);
  
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
        </div>
      </div>
      
      {/* title & gallery */}
      <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
      <ImageGallery images={sortedImages} title={listing.title} />
      
      <div className="flex justify-between items-center my-4">
        <p className="text-gray-500">Добавлено: {formattedDate}</p>
      </div>
      
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
                <p className="mb-2"><span className="text-gray-600">Цена:</span> {formatPrice(listing.price)}</p>
              </div>
              <div>
                {listing.yearBuilt && <p className="mb-2"><span className="text-gray-600">Год:</span> {listing.yearBuilt}</p>}
                {listing.condition && <p className="mb-2"><span className="text-gray-600">Состояние:</span> {listing.condition}</p>}
                <p className="mb-2"><span className="text-gray-600">Код объекта:</span> {listing.listingCode}</p>
                <p className="mb-2"><span className="text-gray-600">Дата добавления:</span> {formattedDate}</p>
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
            <section className="admin-comment mb-6">
              <div className="admin-comment-header">
                <svg className="admin-comment-lock" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <h2 className="text-xl font-bold">Комментарий администратора</h2>
              </div>
              <div className="prose max-w-none text-gray-700">
                {listing.adminComment.split('\n').map((p: string, i: number) => (
                  <p key={i} className="mb-4">
                    {p}
                  </p>
                ))}
              </div>
              <p className="admin-comment-notice">
                Этот комментарий виден только администраторам
              </p>
            </section>
          )}
          
          {/* Delete button section - only visible to admins */}
          {isAdmin && (
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
          )}
        </div>
        
        {/* right sidebar */}
        <aside className="w-full md:w-1/3">
          <div className="bg-white shadow rounded-md p-6 sticky top-4">
            <div className="flex items-center mb-4">
              {listing.user.photo ? (
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0 border border-gray-100">
                  <ClientImage
                    src={listing.user.photo.startsWith('/') ? `/api/image${listing.user.photo}` : listing.user.photo}
                    alt={`Фото ${listing.user.name}`}
                    className="w-full h-full object-cover"
                    width={64}
                    height={64}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">👤</span>
                </div>
              )}
              <div>
                <h3 className="font-bold">{listing.user.name}</h3>
                <p className="text-gray-600">Риелтор</p>
              </div>
            </div>
            <div className="border-t pt-4 text-sm">
              {listing.user.phone && (
                <div className="contact-card-item mb-3">
                  <a href={`tel:${listing.user.phone}`} className="flex items-center group">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 mr-3 group-hover:bg-blue-100 transition-all duration-200">
                      <Phone size={16} />
                    </div>
                    <span className="text-gray-700 group-hover:text-blue-500 transition-all duration-200">
                      {formatPhoneNumber(listing.user.phone)}
                    </span>
                  </a>
                </div>
              )}
              <div className="contact-card-item mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 mr-3">
                    <Hash size={16} />
                  </div>
                  <span className="text-gray-700">
                    {listing.listingCode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// This is the main page component
export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  if (!id) return null;       // or a loading UI
  return <ListingDetailClient id={id} />;
}