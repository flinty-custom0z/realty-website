'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import ImageUpload from '@/components/ImageUpload';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createLogger } from '@/lib/logging';

interface FormData {
  title: string;
  publicDescription: string;
  adminComment: string;
  categoryId: string;
  district: string;
  address: string;
  rooms: string;
  floor: string;
  totalFloors: string;
  houseArea: string;
  kitchenArea: string;
  landArea: string;
  condition: string;
  yearBuilt: string;
  buildingType: string;
  balconyType: string;
  bathroomType: string;
  windowsView: string;
  noEncumbrances: boolean;
  noShares: boolean;
  price: string;
  dealType: 'SALE' | 'RENT';
  status: string;
  userId: string;
}

// Create a logger instance
const logger = createLogger('AdminListingNewPage');

export default function NewListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
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
    kitchenArea: '',
    landArea: '',
    condition: '',
    yearBuilt: '',
    buildingType: '',
    balconyType: '',
    bathroomType: '',
    windowsView: '',
    noEncumbrances: false,
    noShares: false,
    price: '',
    dealType: 'SALE',
    status: 'active',
    userId: '',
  });

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; phone?: string }[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  const [resetKey, setResetKey] = useState(0);

  // Fetch categories and users when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
        
        // Still fetch users for API compatibility
        const usersRes = await fetch('/api/admin/users');
        if (!usersRes.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersRes.json();
        setUsers(usersData);
        
        // Set default userId if users are loaded
        if (usersData.length > 0) {
          setFormData(prev => ({ ...prev, userId: usersData[0].id }));
        }
      } catch (error) {
        logger.error('Error fetching form data:', { error });
        setError('Ошибка при загрузке данных: ' + (error instanceof Error ? error.message : String(error)));
      }
    };
    
    fetchData();
  }, []);

  // Filter categories based on deal type
  useEffect(() => {
    if (categories.length === 0) return;

    // For rent, only allow apartments and commercial
    if (formData.dealType === 'RENT') {
      const allowedSlugs = ['apartments', 'commercial'];
      const filtered = categories.filter(category => allowedSlugs.includes(category.slug));
      setFilteredCategories(filtered);
      
      // If current category is not in allowed list, update to first allowed category
      const currentCategorySlug = categories.find(c => c.id === formData.categoryId)?.slug;
      if (currentCategorySlug && !allowedSlugs.includes(currentCategorySlug) && filtered.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: filtered[0].id }));
      }
    } else {
      // For sale, show all categories
      setFilteredCategories(categories);
    }
  }, [formData.dealType, categories, formData.categoryId]);

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

  const removeImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });
      
      // Add images
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
      
      const response = await fetch('/api/admin/listings', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }
      
      const data = await response.json();
      
      // Show success message
      setSuccess('Объявление успешно создано');
      
      // Reset the image upload tracking
      setUploadingImages({});
      
      // Clear image previews and perform proper cleanup
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      setImagePreviews([]);
      setImageFiles([]);
      
      // Force ImageUpload component to reset
      setResetKey(prev => prev + 1);
      
      // Redirect to the created listing page after a short delay
      setTimeout(() => {
        router.push(`/admin/listings/${data.id}`);
      }, 1500);
    } catch (error) {
      logger.error('Error creating listing:', { error });
      setError(error instanceof Error ? error.message : 'Ошибка при создании объявления');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Новое объявление</h1>
        <Link 
          href="/admin/listings" 
          className="inline-flex items-center text-[#11535F] hover:underline transition-all duration-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Назад к списку
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-medium">Детали объявления</h2>
          </div>
          
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dealType" className="block text-sm font-medium text-gray-700 mb-1">
                Тип сделки *
              </label>
              <select
                id="dealType"
                name="dealType"
                value={formData.dealType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
                required
              >
                <option value="SALE">Продажа</option>
                <option value="RENT">Аренда</option>
              </select>
              {formData.dealType === 'RENT' && (
                <p className="text-xs text-gray-500 mt-1">Для аренды доступны только категории: Квартиры, Коммерция</p>
              )}
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
                required
              >
                {filteredCategories.length === 0 && <option value="">Загрузка категорий...</option>}
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Цена {formData.dealType === 'RENT' ? '(₽/месяц)' : '(₽)'} *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
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
                  className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
                />
              </div>
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="kitchenArea" className="block text-sm font-medium text-gray-700 mb-1">
                Площадь кухни (м²)
              </label>
              <input
                type="number"
                id="kitchenArea"
                name="kitchenArea"
                min="0"
                step="0.1"
                value={formData.kitchenArea}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
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
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
              />
            </div>
            
            <div>
              <label htmlFor="buildingType" className="block text-sm font-medium text-gray-700 mb-1">
                Тип дома
              </label>
              <select
                id="buildingType"
                name="buildingType"
                value={formData.buildingType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
              >
                <option value="">Выберите тип дома</option>
                <option value="BRICK">Кирпичный</option>
                <option value="PANEL">Панельный</option>
                <option value="MONOLITH">Монолитный</option>
                <option value="OTHER">Другой</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="balconyType" className="block text-sm font-medium text-gray-700 mb-1">
                Балкон/Лоджия
              </label>
              <select
                id="balconyType"
                name="balconyType"
                value={formData.balconyType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
              >
                <option value="">Выберите тип</option>
                <option value="BALCONY">Балкон</option>
                <option value="LOGGIA">Лоджия</option>
                <option value="BOTH">Балкон и лоджия</option>
                <option value="NONE">Отсутствует</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="bathroomType" className="block text-sm font-medium text-gray-700 mb-1">
                Санузел
              </label>
              <select
                id="bathroomType"
                name="bathroomType"
                value={formData.bathroomType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
              >
                <option value="">Выберите тип</option>
                <option value="COMBINED">Совмещенный</option>
                <option value="SEPARATE">Раздельный</option>
                <option value="MULTIPLE">Несколько санузлов</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="windowsView" className="block text-sm font-medium text-gray-700 mb-1">
                Окна
              </label>
              <select
                id="windowsView"
                name="windowsView"
                value={formData.windowsView}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
              >
                <option value="">Выберите вид из окон</option>
                <option value="COURTYARD">Во двор</option>
                <option value="STREET">На улицу</option>
                <option value="BOTH">Во двор и на улицу</option>
              </select>
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
                  id="noShares"
                  name="noShares"
                  checked={formData.noShares}
                  onChange={handleChange}
                />
                <span className="checkbox-icon"></span>
                <span className="text-sm text-gray-700">Без долей</span>
              </label>
            </div>
            
            {/* Realtor selection removed as it's no longer needed */}
            {/* Hidden input to maintain the userId value for API compatibility */}
            <input type="hidden" name="userId" value={formData.userId} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-medium">Описание</h2>
          </div>
          
          <div>
            <label htmlFor="publicDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Описание (публичное)
            </label>
            <textarea
              id="publicDescription"
              name="publicDescription"
              value={formData.publicDescription}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
            />

            <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Комментарий администратора (не виден пользователям)
            </label>
            <textarea
              id="adminComment"
              name="adminComment"
              value={formData.adminComment}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-medium">Фотографии</h2>
          </div>
          
          <ImageUpload 
            onImagesSelected={handleImageChange}
            onImageRemoved={removeImage}
            isUploading={isLoading}
            uploadingImages={uploadingImages}
            resetKey={resetKey}
          />
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="admin-add-btn px-8"
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Создать объявление'}
          </button>
        </div>
      </form>
    </div>
  );
}