'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientImage from '@/components/ClientImage';

interface Listing {
  id: string;
  title: string;
  price: number;
  listingCode: string;
  status: string;
  category: {
    name: string;
  };
  images: {
    path: string;
  }[];
  dateAdded: string;
  _count: {
    comments: number;
  };
  district: string;
  address: string;
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    fetchListings();
  }, [pagination.page, categoryFilter, statusFilter]);
  
  const fetchListings = async () => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/admin/listings?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      setListings(data.listings);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteListing = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Refresh listings
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Ошибка при удалении объявления');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление объявлениями</h1>
        <Link
          href="/admin/listings/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-[#4285F4] text-white rounded-[8px] text-sm font-medium hover:bg-[#3b78e7] transition-all duration-200 shadow-sm"
        >
          Добавить объявление
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Фильтры</h2>
        </div>
        
        <div className="p-4 flex flex-wrap gap-4">
          <div>
            <label htmlFor="categoryFilter" className="block text-sm text-gray-700 mb-1">
              Категория
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-48 p-2 border rounded"
            >
              <option value="">Все категории</option>
              <option value="apartments">Квартиры</option>
              <option value="houses">Дома</option>
              <option value="land">Земельные участки</option>
              <option value="commercial">Коммерция</option>
              <option value="industrial">Промышленные объекты</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm text-gray-700 mb-1">
              Статус
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 p-2 border rounded"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Загрузка...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 font-medium">Фото</th>
                    <th className="py-3 px-4 font-medium">Название</th>
                    <th className="py-3 px-4 font-medium">Категория</th>
                    <th className="py-3 px-4 font-medium">Код</th>
                    <th className="py-3 px-4 font-medium">Район</th>
                    <th className="py-3 px-4 font-medium">Адрес</th>
                    <th className="py-3 px-4 font-medium">Цена</th>
                    <th className="py-3 px-4 font-medium">Статус</th>
                    <th className="py-3 px-4 font-medium">Дата</th>
                    <th className="py-3 px-4 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-12 bg-gray-200 rounded overflow-hidden">
                            {listing.images && listing.images[0] ? (
                            <ClientImage
                              src={listing.images[0].path}
                              alt={listing.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                              fallbackSrc="/images/placeholder.png"
                            />
                            ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              Нет фото
                            </div>
                            )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/listings/${listing.id}`} className="text-blue-500 hover:underline">
                          {listing.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{listing.category.name}</td>
                      <td className="py-3 px-4">{listing.listingCode}</td>
                      <td className="py-3 px-4">{listing.district}</td>
                      <td className="py-3 px-4">{listing.address}</td>
                      <td className="py-3 px-4">{listing.price.toLocaleString()} ₽</td>
                      <td className="py-3 px-4">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs ${
                            listing.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {listing.status === 'active' ? 'Активно' : 'Неактивно'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(listing.dateAdded)}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/listings/${listing.id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Редактировать
                          </Link>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t flex justify-center">
                <div className="flex">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination((prev) => ({ ...prev, page }))}
                      className={`w-8 h-8 flex items-center justify-center mx-1 rounded-md ${
                        pagination.page === page
                          ? 'bg-[#4285F4] text-white'
                          : 'bg-[#F5F5F5] text-[#505050] hover:bg-[#EAEAEA]'
                      } transition-all duration-200`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}