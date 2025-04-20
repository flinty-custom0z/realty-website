'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import ClientImage from '@/components/ClientImage';
import Link from 'next/link';
import AdminImagePreview from '@/components/AdminImagePreview';

interface ListingFormData {
  title: string;
  publicDescription: string,
  adminComment: string,
  categoryId: string;
  district: string;
  rooms: string;
  floor: string;
  totalFloors: string;
  houseArea: string;
  landArea: string;
  condition: string;
  yearBuilt: string;
  noEncumbrances: boolean;
  noKids: boolean;
  price: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
}

interface ImageData {
  id: string;
  path: string;
  isFeatured: boolean;
}

interface ListingData extends ListingFormData {
  id: string;
  listingCode: string;
  dateAdded: string;
  images: ImageData[];
  category: Category;
  user: {
    id: string;
    name: string;
  };
  comments: {
    id: string;
    content: string;
    createdAt: string;
  }[];
}

import { useParams } from 'next/navigation';

export default function EditListingPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // For image uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string>('');
  
  // For comments - simplified to use adminComment field
  
  // Form data
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    publicDescription: '',
    adminComment: '',
    categoryId: '',
    district: '',
    rooms: '',
    floor: '',
    totalFloors: '',
    houseArea: '',
    landArea: '',
    condition: '',
    yearBuilt: '',
    noEncumbrances: false,
    noKids: false,
    price: '',
    status: 'active',
  });
  
  // Fetch listing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch listing
        const listingRes = await fetch(`/api/admin/listings/${params.id}`);
        if (!listingRes.ok) {
          throw new Error('Failed to fetch listing');
        }
        const listingData = await listingRes.json();
        setListing(listingData);
        
        // Set form data
        setFormData({
          title: listingData.title,
          publicDescription: listingData.publicDescription || '',
          adminComment: listingData.adminComment || '',
          categoryId: listingData.categoryId,
          district: listingData.district || '',
          rooms: listingData.rooms?.toString() || '',
          floor: listingData.floor?.toString() || '',
          totalFloors: listingData.totalFloors?.toString() || '',
          houseArea: listingData.houseArea?.toString() || '',
          landArea: listingData.landArea?.toString() || '',
          condition: listingData.condition || '',
          yearBuilt: listingData.yearBuilt?.toString() || '',
          noEncumbrances: listingData.noEncumbrances || false,
          noKids: listingData.noKids || false,
          price: listingData.price.toString(),
          status: listingData.status,
        });
        
        // Set featured image
        const featuredImage = listingData.images.find((img: ImageData) => img.isFeatured);
        if (featuredImage) {
          setFeaturedImageId(featuredImage.id);
        }
        
        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load listing data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newPreviews = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };
  
  const removeImagePreview = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const toggleImageToDelete = (imageId: string) => {
    setImagesToDelete(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
    
    // If this was the featured image, unset it
    if (featuredImageId === imageId) {
      setFeaturedImageId('');
    }
  };
  
  const setImageAsFeatured = (imageId: string) => {
    setFeaturedImageId(imageId);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      // Add new images to FormData
      imageFiles.forEach(file => {
        formDataToSend.append('newImages', file);
      });
      
      // Add images to delete
      formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      
      // Set featured image
      if (featuredImageId) {
        formDataToSend.append('featuredImageId', featuredImageId);
      }
      
      const response = await fetch(`/api/admin/listings/${params.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing');
      }
      
      // Clear image uploads
      setImageFiles([]);
      setImagePreviews([]);
      setImagesToDelete([]);
      
      // Show success message
      setSuccess('Объявление успешно обновлено');
      
      // Refresh listing data
      const updatedListing = await response.json();
      setListing(prev => {
        if (!prev) return updatedListing;
        return {
          ...prev,
          ...updatedListing,
          images: updatedListing.images || prev.images,
        };
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при обновлении объявления');
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Загрузка...</p>
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error || 'Объявление не найдено'}</p>
        <Link href="/admin/listings" className="text-red-600 underline mt-2 inline-block">
          Вернуться к списку объявлений
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Редактирование объявления</h1>
        <div className="space-x-2">
          <Link
            href={`/listing/${listing.id}`}
            target="_blank"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Просмотр на сайте
          </Link>
          
          <Link
            href="/admin/listings"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Назад к списку
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h2 className="text-lg font-medium">Детали объявления</h2>
          <div className="text-sm text-gray-500">
            Код объекта: {listing.listingCode} | Добавлено: {formatDate(listing.dateAdded)}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Название *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Цена (₽) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Статус *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="active">Активно</option>
                <option value="inactive">Неактивно</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                Район
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                Количество комнат
              </label>
              <input
                type="number"
                id="rooms"
                name="rooms"
                min="0"
                value={formData.rooms}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Этаж
              </label>
              <input
                type="number"
                id="floor"
                name="floor"
                min="0"
                value={formData.floor}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700 mb-1">
                Этажность
              </label>
              <input
                type="number"
                id="totalFloors"
                name="totalFloors"
                min="0"
                value={formData.totalFloors}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="houseArea" className="block text-sm font-medium text-gray-700 mb-1">
                Площадь (м²)
              </label>
              <input
                type="number"
                id="houseArea"
                name="houseArea"
                min="0"
                step="0.1"
                value={formData.houseArea}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="landArea" className="block text-sm font-medium text-gray-700 mb-1">
                Площадь участка (сот.)
              </label>
              <input
                type="number"
                id="landArea"
                name="landArea"
                min="0"
                step="0.1"
                value={formData.landArea}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Состояние
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Выберите состояние</option>
                <option value="Черновая">Черновая</option>
                <option value="Предчистовая">Предчистовая</option>
                <option value="Требуется ремонт">Требуется ремонт</option>
                <option value="Частичный ремонт">Частичный ремонт</option>
                <option value="Ремонт под ключ">Ремонт под ключ</option>
                <option value="Хорошее">Хорошее</option>
                <option value="Евроремонт">Евроремонт</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                Год постройки
              </label>
              <input
                type="number"
                id="yearBuilt"
                name="yearBuilt"
                min="1900"
                max="2030"
                value={formData.yearBuilt}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noEncumbrances"
                  name="noEncumbrances"
                  checked={formData.noEncumbrances}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="noEncumbrances" className="text-sm text-gray-700">
                  Без обременений
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noKids"
                  name="noKids"
                  checked={formData.noKids}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="noKids" className="text-sm text-gray-700">
                  Без детей
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="publicDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Описание (публичное)
            </label>
            <textarea
              id="publicDescription"
              name="publicDescription"
              value={formData.publicDescription}
              onChange={(e) => setFormData({ ...formData, publicDescription: e.target.value })}
              rows={6}
              className="w-full p-2 border rounded"
            />

            <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Комментарий администратора (не виден пользователям)
            </label>
            <textarea
              id="adminComment"
              name="adminComment"
              value={formData.adminComment}
              onChange={(e) => setFormData({ ...formData, adminComment: e.target.value })}
              rows={6}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Фотографии</h3>
            
            {listing.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Текущие фотографии:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(listing.images.slice().sort((a, b) => {
                    if (a.isFeatured === b.isFeatured) return 0;
                    return a.isFeatured ? -1 : 1;
                  })).map(image => (
                    <AdminImagePreview
                    key={image.id}
                      image={image}
                      isSelected={featuredImageId === image.id}
                      isMarkedForDeletion={imagesToDelete.includes(image.id)}
                      onToggleDelete={toggleImageToDelete}
                      onSetFeatured={setImageAsFeatured}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-700 mb-2">Добавить новые фотографии:</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
              />
              
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <ClientImage
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImagePreview(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-blue-300"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}