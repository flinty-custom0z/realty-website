'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import ClientImage from '@/components/ClientImage';
import TruncatedCell from '@/components/ui/TruncatedCell';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/Button';
import { formatDate, formatPrice } from '@/lib/utils';
import { createLogger } from '@/lib/logging';
import AdminNavMenuClient from '@/components/AdminNavMenuClient';

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
  dealType: string;
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
  const [dealTypeFilter, setDealTypeFilter] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'dealType' | 'category'>('none');
  const [sortField, setSortField] = useState<'dateAdded' | 'price' | 'title'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Sort listings based on current sort field and order
  const sortedListings = useMemo(() => {
    return [...listings].sort((a, b) => {
      if (sortField === 'dateAdded') {
        const dateA = new Date(a.dateAdded).getTime();
        const dateB = new Date(b.dateAdded).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortField === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
  }, [listings, sortField, sortOrder]);
  
  // Group listings by selected option (using sorted listings)
  const groupedListings = useMemo(() => {
    if (groupBy === 'none') return { ungrouped: sortedListings };
    
    return sortedListings.reduce((groups: Record<string, Listing[]>, listing) => {
      let key: string;
      
      if (groupBy === 'dealType') {
        key = listing.dealType === 'SALE' ? 'Продажа' : 'Аренда';
      } else if (groupBy === 'category') {
        key = listing.category.name;
      } else {
        key = 'ungrouped';
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(listing);
      return groups;
    }, {});
  }, [sortedListings, groupBy]);

  // Handle sort toggle for column headers
  const handleSortToggle = (field: 'dateAdded' | 'price' | 'title') => {
    if (sortField === field) {
      // Toggle order if already sorting by this field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with default desc order
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  // Render sort indicator arrow
  const renderSortIndicator = (field: 'dateAdded' | 'price' | 'title') => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1 text-xs">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };
  
  useEffect(() => {
    fetchListings();
  }, [pagination.page, categoryFilter, statusFilter, dealTypeFilter]);
  
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

      if (dealTypeFilter) {
        params.append('dealType', dealTypeFilter);
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
      <AdminNavMenuClient />
      
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

          <div className="filter-group">
            <label htmlFor="dealTypeFilter" className="block text-sm text-gray-700 mb-2">
              Тип сделки
            </label>
            <select
              id="dealTypeFilter"
              value={dealTypeFilter}
              onChange={(e) => setDealTypeFilter(e.target.value)}
              className="w-full sm:w-48 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">Все типы сделок</option>
              <option value="sale">Продажа</option>
              <option value="rent">Аренда</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="groupByFilter" className="block text-sm text-gray-700 mb-2">
              Группировка
            </label>
            <select
              id="groupByFilter"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'none' | 'dealType' | 'category')}
              className="w-full sm:w-48 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
            >
              <option value="none">Без группировки</option>
              <option value="dealType">По типу сделки</option>
              <option value="category">По категории</option>
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
              {groupBy === 'none' ? (
                <table className="admin-table w-full admin-table-mobile">
                  <thead>
                    <tr>
                      <th className="w-16">Фото</th>
                      <th 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSortToggle('title')}
                      >
                        Название {renderSortIndicator('title')}
                      </th>
                      <th>Категория</th>
                      <th>Код</th>
                      <th>Район</th>
                      <th>Адрес</th>
                      <th 
                        className="text-right cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSortToggle('price')}
                      >
                        Цена {renderSortIndicator('price')}
                      </th>
                      <th>Тип</th>
                      <th>Статус</th>
                      <th 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSortToggle('dateAdded')}
                      >
                        Дата {renderSortIndicator('dateAdded')}
                      </th>
                      <th className="text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedListings.map((listing) => (
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
                        <td data-label="Тип">
                          <span className={`px-2 py-1 rounded-full text-xs ${listing.dealType === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                            {listing.dealType === 'SALE' ? 'Продажа' : 'Аренда'}
                          </span>
                        </td>
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
              ) : (
                <div className="grouped-listings">
                  {Object.entries(groupedListings).map(([groupName, groupItems]) => (
                    <div key={groupName} className="mb-8 border rounded-lg shadow-sm overflow-hidden">
                      <h3 className="text-xl font-medium py-3 px-4 bg-gray-100 border-b flex justify-between items-center">
                        <span>
                          {groupName}
                          <span className="ml-2 text-sm font-normal text-gray-600">
                            ({groupItems.length} {groupItems.length === 1 ? 'объявление' : groupItems.length < 5 ? 'объявления' : 'объявлений'})
                          </span>
                        </span>
                        {groupBy === 'dealType' && (
                          <span className={`px-3 py-1 rounded-full text-sm ${groupName === 'Продажа' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                            {groupName}
                          </span>
                        )}
                      </h3>
                      <table className="admin-table w-full admin-table-mobile">
                        <thead>
                          <tr>
                            <th className="w-16">Фото</th>
                            <th 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleSortToggle('title')}
                            >
                              Название {renderSortIndicator('title')}
                            </th>
                            <th>Категория</th>
                            <th>Код</th>
                            <th>Район</th>
                            <th>Адрес</th>
                            <th 
                              className="text-right cursor-pointer hover:bg-gray-50"
                              onClick={() => handleSortToggle('price')}
                            >
                              Цена {renderSortIndicator('price')}
                            </th>
                            <th>Тип</th>
                            <th>Статус</th>
                            <th 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleSortToggle('dateAdded')}
                            >
                              Дата {renderSortIndicator('dateAdded')}
                            </th>
                            <th className="text-right">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupItems.map((listing) => (
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
                              <td data-label="Тип">
                                <span className={`px-2 py-1 rounded-full text-xs ${listing.dealType === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {listing.dealType === 'SALE' ? 'Продажа' : 'Аренда'}
                                </span>
                              </td>
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
                  ))}
                </div>
              )}
            </div>
            
            {sortedListings.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>Нет объявлений, соответствующих выбранным фильтрам</p>
              </div>
            )}
            
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