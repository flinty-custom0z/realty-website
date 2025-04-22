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
          className="admin-add-btn"
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
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Фото</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Код</th>
                    <th>Район</th>
                    <th>Адрес</th>
                    <th>Цена</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td>
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
                      <td>
                        <Link href={`/admin/listings/${listing.id}`} className="admin-edit-link">
                          {listing.title}
                        </Link>
                      </td>
                      <td>{listing.category.name}</td>
                      <td>{listing.listingCode}</td>
                      <td>{listing.district}</td>
                      <td>{listing.address}</td>
                      <td>{listing.price.toLocaleString()} ₽</td>
                      <td>
                        <span 
                          className={`status-badge ${
                            listing.status === 'active' 
                              ? 'status-badge-active' 
                              : 'status-badge-inactive'
                          }`}
                        >
                          {listing.status === 'active' ? 'Активно' : 'Неактивно'}
                        </span>
                      </td>
                      <td><span className="timestamp">{formatDate(listing.dateAdded)}</span></td>
                      <td>
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/listings/${listing.id}`}
                            className="admin-edit-link"
                          >
                            Редактировать
                          </Link>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="admin-delete-btn"
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
                      className={`pagination-btn ${
                        pagination.page === page
                          ? 'pagination-btn-active'
                          : 'pagination-btn-inactive'
                      }`}
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