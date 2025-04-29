import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale'; // Import Russian locale
import ClientImage from '@/components/ClientImage';
import ImageModal from '@/components/ImageModal';
import { Eye } from 'lucide-react';

interface HistoryChange {
  before: any;
  after: any;
}

interface ImageChange {
  added?: Array<{
    filename: string;
    size: string;
    path?: string; // Add optional path for added images
  }>;
  deleted?: Array<{
    id: string;
    path: string;
  }>;
  featuredChanged?: {
    previous: string;
    new: string;
    previousPath?: string;
    newPath?: string;
  };
}

interface HistoryEntry {
  id: string;
  createdAt: string;
  action: 'create' | 'update' | 'delete' | 'images';
  changes: Record<string, HistoryChange> | ImageChange | { action: string };
  userName: string;
}

interface ListingHistoryProps {
  listingId: string;
}

export default function ListingHistory({ listingId }: ListingHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState('');

  const openImageModal = (imagePath: string) => {
    setSelectedImageSrc(imagePath);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/listings/${listingId}/history`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listing history');
        }
        
        const data = await response.json();
        // Process the data to ensure all entries are properly formatted
        const processedData = data.map((entry: HistoryEntry) => {
          // Handle image upload entries specifically
          if (entry.action === 'images' && typeof entry.changes === 'object') {
            const imgChanges = entry.changes as any;
            
            // Process added images
            if (imgChanges.added && Array.isArray(imgChanges.added)) {
              imgChanges.added = imgChanges.added.map((img: any) => {
                // Ensure path exists and starts with /
                if (img.path && !img.path.startsWith('/') && !img.path.startsWith('http')) {
                  img.path = `/${img.path}`;
                }
                
                // If still no path but we have filename, try to construct one
                if (!img.path && img.filename) {
                  img.path = `/images/listing/${listingId}/${img.filename}`;
                }
                
                return img;
              });
            }
            
            // Process deleted images to ensure paths are correct
            if (imgChanges.deleted && Array.isArray(imgChanges.deleted)) {
              imgChanges.deleted = imgChanges.deleted.map((img: any) => {
                // Ensure path exists and is properly formatted
                if (!img.path) {
                  return img;
                }
                
                if (img.path && !img.path.startsWith('/') && !img.path.startsWith('http')) {
                  return { ...img, path: `/${img.path}` };
                }
                
                if (img.path && img.path.startsWith('https://')) {
                  // External Vercel Blob URLs should be used directly
                  return img;
                }
                
                return img;
              });
            }
            
            // Ensure featuredChanged has proper paths
            if (imgChanges.featuredChanged) {
              const fc = imgChanges.featuredChanged;
              
              if (fc.newPath && !fc.newPath.startsWith('/') && !fc.newPath.startsWith('http')) {
                fc.newPath = `/${fc.newPath}`;
              }
              
              if (fc.previousPath && !fc.previousPath.startsWith('/') && !fc.previousPath.startsWith('http')) {
                fc.previousPath = `/${fc.previousPath}`;
              }
            }
          }
          
          return entry;
        });
        
        setHistory(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить историю');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [listingId]);

  const formatFieldName = (field: string): string => {
    // Map field names to more readable versions
    const fieldMap: Record<string, string> = {
      title: 'Название',
      publicDescription: 'Публичное описание',
      adminComment: 'Комментарий администратора',
      categoryId: 'Категория',
      district: 'Район',
      address: 'Адрес',
      rooms: 'Комнаты',
      floor: 'Этаж',
      totalFloors: 'Этажность',
      houseArea: 'Площадь помещения',
      landArea: 'Площадь участка',
      condition: 'Состояние',
      yearBuilt: 'Год постройки',
      noEncumbrances: 'Без обременений',
      noKids: 'Без детей',
      price: 'Цена',
      status: 'Статус',
      userId: 'Риелтор'
    };

    return fieldMap[field] || field;
  };

  const renderImageChanges = (changes: ImageChange) => {
    return (
      <div className="space-y-4">
        {changes.added && changes.added.length > 0 && (
          <div>
            <h4 className="font-medium text-sm">Добавлено {changes.added.length} {changes.added.length > 1 ? 'изображений' : 'изображение'}</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {changes.added.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 border border-green-300 rounded overflow-hidden group cursor-pointer"
                  onClick={() => img.path && openImageModal(img.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && img.path && openImageModal(img.path)}
                >
                  {img.path ? (
                    <>
                      <ClientImage
                        src={img.path}
                        alt={`${img.filename}`}
                        fill
                        className="object-cover"
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity"
                        aria-label="Просмотр фото"
                      >
                        <Eye size={16} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs p-1 text-center">
                      {img.filename.length > 10 ? img.filename.substring(0, 10) + '...' : img.filename}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-1 text-xs timestamp">
              {changes.added.map((img, idx) => (
                <div key={idx}>
                  {idx + 1}. {img.filename} ({img.size})
                </div>
              ))}
            </div>
          </div>
        )}
        
        {changes.deleted && changes.deleted.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-red-600">Удалено {changes.deleted.length} {changes.deleted.length > 1 ? 'изображений' : 'изображение'}</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {changes.deleted.map((img) => (
                <div
                  key={img.id}
                  className="relative w-16 h-16 border border-red-300 rounded overflow-hidden group cursor-pointer"
                  onClick={() => openImageModal(img.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && openImageModal(img.path)}
                >
                  <ClientImage
                    src={img.path}
                    alt="Удаленное изображение"
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity"
                    aria-label="Просмотр фото"
                  >
                    <Eye size={16} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {changes.featuredChanged && (
          <div>
            <h4 className="font-medium text-sm">Изменено главное изображение</h4>
            {changes.featuredChanged.previousPath && changes.featuredChanged.newPath && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="relative w-16 h-16 border border-gray-300 rounded overflow-hidden group cursor-pointer"
                  onClick={() => changes.featuredChanged?.previousPath && openImageModal(changes.featuredChanged.previousPath)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && changes.featuredChanged?.previousPath && openImageModal(changes.featuredChanged.previousPath)}
                >
                  <ClientImage
                    src={changes.featuredChanged.previousPath}
                    alt="Предыдущее главное изображение"
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity"
                    aria-label="Просмотр фото"
                  >
                    <Eye size={16} className="text-white" />
                  </div>
                </div>
                <span className="text-gray-500">→</span>
                <div
                  className="relative w-16 h-16 border border-blue-300 rounded overflow-hidden group cursor-pointer"
                  onClick={() => changes.featuredChanged?.newPath && openImageModal(changes.featuredChanged.newPath)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && changes.featuredChanged?.newPath && openImageModal(changes.featuredChanged.newPath)}
                >
                  <ClientImage
                    src={changes.featuredChanged.newPath}
                    alt="Новое главное изображение"
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity"
                    aria-label="Просмотр фото"
                  >
                    <Eye size={16} className="text-white" />
                  </div>
                </div>
              </div>
            )}
            {(!changes.featuredChanged.previousPath || !changes.featuredChanged.newPath) && (
              <div className="text-sm text-gray-600 mt-1">
                {!changes.featuredChanged.previousPath && changes.featuredChanged.newPath ? (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative w-16 h-16 border border-gray-300 rounded overflow-hidden bg-gray-200 group">
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        Удалено
                      </div>
                    </div>
                    
                    <span className="text-gray-500">→</span>
                    
                    <div className="relative w-16 h-16 border border-blue-300 rounded overflow-hidden group">
                      <ClientImage
                        src={changes.featuredChanged.newPath}
                        alt="Новое главное изображение"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => changes.featuredChanged?.newPath && openImageModal(changes.featuredChanged.newPath)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity"
                        aria-label="Просмотр фото"
                      >
                        <Eye size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    Информация о путях к изображениям недоступна
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-4 text-center">Загрузка истории...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Ошибка: {error}</div>;
  }

  if (history.length === 0) {
    return <div className="p-4 text-gray-500">История изменений недоступна для этого объявления.</div>;
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">История изменений</h3>
        
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="border-b pb-4">
              <div className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{entry.userName}</span> 
                  <span className="ml-2 text-gray-600">
                    {entry.action === 'create' 
                      ? 'создал(а) это объявление' 
                      : entry.action === 'update' 
                        ? 'обновил(а) объявление'
                        : entry.action === 'images'
                          ? 'изменил(а) изображения'
                          : 'удалил(а) объявление'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true, locale: ru })}
                </div>
              </div>

              {entry.action === 'create' && 'action' in entry.changes && (
                <div className="text-sm text-gray-600 ml-2">
                  {entry.changes.action as string}
                </div>
              )}

              {entry.action === 'update' && (
                <div className="mt-2 space-y-2">
                  {Object.entries(entry.changes as Record<string, HistoryChange>).map(([field, change]) => (
                    <div key={field} className="grid grid-cols-3 text-sm">
                      <div className="font-medium">{formatFieldName(field)}</div>
                      <div className="text-red-500 line-through">
                        {change.before === null ? 'Пусто' : 
                         typeof change.before === 'boolean' ? (change.before ? 'Да' : 'Нет') : 
                         change.before}
                      </div>
                      <div className="text-green-500">
                        {change.after === null ? 'Пусто' : 
                         typeof change.after === 'boolean' ? (change.after ? 'Да' : 'Нет') : 
                         change.after}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entry.action === 'images' && (
                <div className="mt-2">
                  {renderImageChanges(entry.changes as ImageChange)}
                </div>
              )}

              {entry.action === 'delete' && 'action' in entry.changes && (
                <div className="text-sm text-gray-600 ml-2">
                  Объявление было удалено: {(entry.changes as any).title || 'Неизвестное объявление'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {imageModalOpen && (
        <ImageModal
          src={selectedImageSrc}
          alt="Изображение"
          onClose={closeImageModal}
        />
      )}
    </>
  );
} 