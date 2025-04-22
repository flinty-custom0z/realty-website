'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import ClientImage from '@/components/ClientImage';
import { Loader2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import Button from '@/components/Button';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImagePreview {
  file: File;
  url: string;
}

interface User {
  id: string;
  name: string;
  phone?: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
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
    userId: '',
  });
  
  // Add state for tracking individual image upload status
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        console.log('Categories fetched:', data);
        setCategories(data);
        
        // Set default category
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please refresh the page and try again.');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch users (realtors) on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, userId: data[0].id }));
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchUsers();
  }, []);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleImageChange = (newFiles: File[]) => {
    setImageFiles((prev) => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newPreviews = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };
  
  const removeImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Creating new listing...');
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });
      
      // Add images with individual upload tracking
      if (imageFiles.length > 0) {
        // Create a tracking object with all images set to uploading
        const imageUploadStatus: Record<string, boolean> = {};
        imageFiles.forEach((file, index) => {
          const imageId = `${file.name}-${index}`;
          imageUploadStatus[imageId] = true;
          formDataToSend.append('images', file);
        });
        setUploadingImages(imageUploadStatus);
      }
      
      console.log('Sending form data...');
      const response = await fetch('/api/admin/listings', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Server error response:', responseData);
        throw new Error(responseData.error || 'Failed to create listing');
      }
      
      console.log('Listing created successfully:', responseData);
      setSuccess('Объявление успешно создано!');
      
      // Wait a moment to show success message before redirecting
      setTimeout(() => {
        router.push(`/admin/listings/${responseData.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при создании объявления');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Создать новое объявление</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
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
              {categories.length === 0 && (
                <option value="">Загрузка категорий...</option>
              )}
              {categories.map((category) => (
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
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Фотографии</label>
          <ImageUpload 
            onImagesSelected={handleImageChange}
            onImageRemoved={removeImage}
            isUploading={isLoading}
            uploadingImages={uploadingImages}
          />
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="px-6"
          >
            Создать объявление
          </Button>
        </div>
      </form>
    </div>
  );
}