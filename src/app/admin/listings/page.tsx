'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import ClientImage from '@/components/ClientImage';
import TruncatedCell from '@/components/ui/TruncatedCell';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/Button';
import { formatDate, formatPrice } from '@/lib/utils';
import { createLogger } from '@/lib/logging';

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

// Create a logger instance
const logger = createLogger('AdminListingsPage');

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
      logger.error('Error fetching listings:', { error });
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
      logger.error('Error deleting listing:', { error });
      alert('Ошибка при удалении объявления');
    }
  };
  
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Управление объявлениями</h1>
        <Button
          variant="primary"
          icon={<PlusCircle size={16} />}
          onClick={() => window.location.href = '/admin/listings/new'}
        >
          Добавить объявление
        </Button>
      </div>
      
      <div className="filter-controls mb-6">
        <h2 className="text-lg font-medium mb-4">Фильтры</h2>
        
        <div className="flex flex-wrap gap-6">
          <div className="filter-group">
            <label htmlFor="categoryFilter" className="block text-sm text-gray-700 mb-2">
              Категория
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-48 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">Все категории</option>
              <option value="apartments">Квартиры</option>
              <option value="houses">Дома</option>
              <option value="land">Земельные участки</option>
              <option value="commercial">Коммерция</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="statusFilter" className="block text-sm text-gray-700 mb-2">
              Статус
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
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
            <div className="overflow-x-auto admin-table-container">
              <table className="admin-table w-full admin-table-mobile">
                <thead>
                  <tr>
                    <th className="w-16">Фото</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Код</th>
                    <th>Район</th>
                    <th>Адрес</th>
                    <th className="text-right">Цена</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th className="text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="image-cell" data-label="Фото">
                        <div className="relative w-12 h-12 bg-gray-50 rounded overflow-hidden border border-gray-100">
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
                      <td className="title-cell" data-label="Название">
                        <Link 
                          href={`/listing/${listing.id}`}
                          className="hover:deal-accent-text transition-colors duration-200 cursor-pointer"
                          target="_blank"
                        >
                          <TruncatedCell text={listing.title} maxWidth={220} />
                        </Link>
                      </td>
                      <td data-label="Категория">{listing.category.name}</td>
                      <td data-label="Код">{listing.listingCode}</td>
                      <td data-label="Район">{listing.district}</td>
                      <td data-label="Адрес">
                        <TruncatedCell text={listing.address} maxWidth={180} />
                      </td>
                      <td className="text-right font-medium" data-label="Цена">{formatPrice(listing.price)}</td>
                      <td className="status-cell" data-label="Статус">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td data-label="Дата"><span className="timestamp">{formatDate(listing.dateAdded)}</span></td>
                      <td className="actions-cell" data-label="Действия">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Edit2 size={14} />}
                            onClick={() => window.location.href = `/admin/listings/${listing.id}`}
                          >
                            Ред.
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash2 size={14} />}
                            onClick={() => handleDeleteListing(listing.id)}
                          >
                            Удал.
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center pt-4 pb-8">
                <div className="flex space-x-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setPagination((prev) => ({ ...prev, page }));
                        window.scrollTo(0, 0);
                      }}
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