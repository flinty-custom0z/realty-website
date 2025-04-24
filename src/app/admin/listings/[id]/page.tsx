'use client';

import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ClientImage from '@/components/ClientImage';
import Link from 'next/link';
import AdminImagePreview from '@/components/AdminImagePreview';
import ImageModal from '@/components/ImageModal';
import { Eye, Loader2, ArrowLeft } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import Button from '@/components/Button';

interface ListingFormData {
  title: string;
  publicDescription: string,
  adminComment: string,
  categoryId: string;
  district: string;
  address: string;
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

interface User {
  id: string;
  name: string;
  phone?: string;
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
  const [users, setUsers] = useState<User[]>([]);
  
  // For image uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string>('');
  
  // Add state for tracking individual image upload status
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  
  // Form data
  const [formData, setFormData] = useState<ListingFormData & { userId?: string }>({
    title: '',
    publicDescription: '',
    adminComment: '',
    categoryId: '',
    district: '',
    address: '',
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
    userId: '',
  });
  
  // Add new state for image preview modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState('');
  
  // Ref for clearing file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch users (realtors) and listing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersRes = await fetch('/api/admin/users');
        const usersData = usersRes.ok ? await usersRes.json() : [];
        setUsers(usersData);
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
          address: listingData.address || '',
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
          userId: listingData.user?.id || (usersData[0]?.id ?? ''),
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
  
  const handleImageChange = (newFiles: File[]) => {
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
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      router.push('/admin/listings');
    } catch (error) {
      setError('Error deleting listing');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });
      
      // Add featured image ID if it exists
      if (featuredImageId) {
        formDataToSend.append('featuredImageId', featuredImageId);
      }
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      
      // Add new images with individual upload tracking
      if (imageFiles.length > 0) {
        // Create a tracking object with all images set to uploading
        const imageUploadStatus: Record<string, boolean> = {};
        imageFiles.forEach((file, index) => {
          const imageId = `${file.name}-${index}`;
          imageUploadStatus[imageId] = true;
          formDataToSend.append('newImages', file);
        });
        setUploadingImages(imageUploadStatus);
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
      
      // Reset the file input so selected file names are cleared
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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
  
  const openPreviewModal = (imageUrl: string) => {
    setPreviewModalImage(imageUrl);
    setPreviewModalOpen(true);
  };
  
  const closePreviewModal = () => {
    setPreviewModalOpen(false);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Редактирование объявления</h1>
        <div className="admin-btn-group">
          <Button
            variant="secondary"
            onClick={() => window.open(`/listing/${listing.id}`, '_blank')}
          >
            Просмотр на сайте
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push(`/admin/listings/${listing.id}/history`)}
          >
            История изменений
          </Button>
          <Button
            variant="secondary"
            icon={<ArrowLeft size={16} />}
            onClick={() => router.push('/admin/listings')}
          >
            Назад к списку
          </Button>
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
      
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
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
                className="w-full p-2 border rounded-md focus:border-[#4285F4] focus:ring focus:ring-blue-100 transition-all duration-200"
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
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
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
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  id="noEncumbrances"
                  name="noEncumbrances"
                  checked={formData.noEncumbrances}
                  onChange={handleChange}
                />
                <span className="checkbox-icon"></span>
                <span className="text-sm text-gray-700">Без обременений</span>
              </label>
              
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  id="noKids"
                  name="noKids"
                  checked={formData.noKids}
                  onChange={handleChange}
                />
                <span className="checkbox-icon"></span>
                <span className="text-sm text-gray-700">Без детей</span>
              </label>
            </div>
            
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                Риелтор (контактное лицо) *
              </label>
              <select
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                {users.length === 0 && <option value="">Загрузка риелторов...</option>}
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.phone ? `(${user.phone})` : ''}
                  </option>
                ))}
              </select>
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
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Фотографии</h2>
              
            <div className="space-y-6">
              {listing && listing.images.length > 0 && (
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
                <ImageUpload 
                  onImagesSelected={handleImageChange}
                  onImageRemoved={removeImagePreview}
                  isUploading={isSaving}
                  uploadingImages={uploadingImages}
                  previewModalHandler={openPreviewModal}
                />
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 mt-8 flex justify-between items-center">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="mr-4"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Delete section */}
      <div className="bg-red-50 rounded-lg p-6 border border-red-100 mb-6">
        <h2 className="text-lg font-medium text-red-700 mb-4">Опасная зона</h2>
        <p className="text-gray-700 mb-4">Удаление объявления приведет к полному удалению всех данных и не может быть отменено.</p>
        <Button
          variant="danger"
          onClick={() => handleDelete()}
          disabled={isSaving}
        >
          Удалить объявление
        </Button>
      </div>
      
      {previewModalOpen && (
        <ImageModal
          src={previewModalImage}
          alt="Просмотр фото"
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
    </div>
  );
}