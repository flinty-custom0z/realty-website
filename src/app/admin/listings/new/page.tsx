'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createLogger } from '@/lib/logging';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import PriceInput from '@/components/ui/PriceInput';
import MarkdownToolbar from '@/components/admin/MarkdownToolbar';
import MarkdownPreview from '@/components/admin/MarkdownPreview';
import { compressImage, CompressionOptions } from '@/lib/utils/imageOptimization';

interface FormData {
  publicDescription: string;
  adminComment: string;
  categoryId: string;
  districtId: string;
  typeId: string;
  address: string;
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
  cityId: string;
}

// Create a logger instance
const logger = createLogger('AdminListingNewPage');

const COMPRESSION_CONFIG: CompressionOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
  maxSizeKB: 1024,
  outputFormat: 'jpeg',
};

export default function NewListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    publicDescription: '',
    adminComment: '',
    categoryId: '',
    districtId: '',
    typeId: '',
    address: '',
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
    cityId: '',
  });

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [filteredPropertyTypes, setFilteredPropertyTypes] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [showNewDistrictInput, setShowNewDistrictInput] = useState(false);
  const [newDistrict, setNewDistrict] = useState('');
  const [isCreatingDistrict, setIsCreatingDistrict] = useState(false);
  const [districtError, setDistrictError] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  // We still need to fetch users for API compatibility, but we don't need to expose the state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  const [resetKey, setResetKey] = useState(0);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [fullAddress, setFullAddress] = useState('');
  const [cities, setCities] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [showNewCityInput, setShowNewCityInput] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [isCreatingCity, setIsCreatingCity] = useState(false);
  const [cityError, setCityError] = useState('');
  const [compressionProgress, setCompressionProgress] = useState<number>(0);

  // Fetch categories, districts, and users when the component mounts
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
        
        // Fetch districts
        const districtsRes = await fetch('/api/districts');
        if (!districtsRes.ok) {
          throw new Error('Failed to fetch districts');
        }
        const districtsData = await districtsRes.json();
        setDistricts(districtsData);
        
        // Fetch property types
        const propertyTypesRes = await fetch('/api/admin/property-types');
        if (!propertyTypesRes.ok) {
          throw new Error('Failed to fetch property types');
        }
        const propertyTypesData = await propertyTypesRes.json();
        setPropertyTypes(propertyTypesData);
        
        // Still fetch users for API compatibility
        const usersRes = await fetch('/api/admin/users');
        if (!usersRes.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersRes.json();
        
        // Set default userId if users are loaded
        if (usersData.length > 0) {
          setFormData(prev => ({ ...prev, userId: usersData[0].id }));
        }
        
        // Fetch cities
        const citiesRes = await fetch('/api/cities');
        if (!citiesRes.ok) throw new Error('Failed to fetch cities');
        const citiesData = await citiesRes.json();
        setCities(citiesData);
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

  // Filter property types based on selected category
  useEffect(() => {
    if (propertyTypes.length === 0 || !formData.categoryId) {
      setFilteredPropertyTypes([]);
      return;
    }

    const filtered = propertyTypes.filter(
      propertyType => propertyType.categoryId === formData.categoryId
    );
    
    setFilteredPropertyTypes(filtered);
    
    // Clear selected property type if it's not in the filtered list
    if (formData.typeId && !filtered.some(pt => pt.id === formData.typeId)) {
      setFormData(prev => ({ ...prev, typeId: '' }));
    }
  }, [formData.categoryId, propertyTypes, formData.typeId]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Special handling for categoryId to ensure proper property type filtering
    if (name === 'categoryId') {
      if (value) {
        const newCategory = categories.find(c => c.id === value);
        const newCategorySlug = newCategory?.slug;
        
        // Check if the new category has property types
        const hasPropertyTypes = propertyTypes.some(pt => pt.categoryId === value);
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          // Clear typeId when switching to international or new-construction or a category without property types
          typeId: (newCategorySlug === 'international' || newCategorySlug === 'new-construction' || !hasPropertyTypes) ? '' : prev.typeId
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          typeId: '' // Clear typeId when category is cleared
        }));
      }
    }
    // Special handling for district selection
    else if (name === 'districtId') {
      if (value === 'new') {
        // Show new district input form
        setShowNewDistrictInput(true);
        // Don't update the districtId in formData
      } else {
        // Normal district selection
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
    // Special handling for numeric inputs
    else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : ''
      }));
    }
    // Special handling for checkboxes
    else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev, 
        [name]: checked
      }));
    }
    // Default handling for other fields
    else {
      setFormData(prev => ({
        ...prev, 
        [name]: value
      }));
    }
  };
  
  // Handle direct value changes from custom components
  const handleValueChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (newFiles: File[]) => {
    setCompressionProgress(0);
    try {
      const compressedFiles: File[] = [];
      for (let i = 0; i < newFiles.length; i++) {
        setCompressionProgress(Math.round(((i + 1) / newFiles.length) * 100));
        try {
          const compressed = await compressImage(newFiles[i], COMPRESSION_CONFIG);
          compressedFiles.push(compressed);
        } catch {
          // Fallback to original if compression fails
          compressedFiles.push(newFiles[i]);
        }
      }
      setImageFiles(prev => [...prev, ...compressedFiles]);
      // Create preview URLs
      const newPreviews = compressedFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    } finally {
      setCompressionProgress(0);
    }
  };

  const removeImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateDistrict = async () => {
    if (!newDistrict.trim()) {
      setDistrictError('Название района не может быть пустым');
      return;
    }
    
    setIsCreatingDistrict(true);
    setDistrictError('');
    
    try {
      const response = await fetch('/api/districts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newDistrict.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          // District already exists, use the existing one
          setDistricts(prev => 
            prev.find(d => d.id === data.district.id) 
              ? prev 
              : [...prev, data.district]
          );
          setFormData(prev => ({ ...prev, districtId: data.district.id }));
          setShowNewDistrictInput(false);
          setNewDistrict('');
        } else {
          throw new Error(data.error || 'Failed to create district');
        }
      } else {
        // District created successfully
        setDistricts(prev => [...prev, data]);
        setFormData(prev => ({ ...prev, districtId: data.id }));
        setShowNewDistrictInput(false);
        setNewDistrict('');
      }
    } catch (error) {
      setDistrictError(error instanceof Error ? error.message : 'Ошибка при создании района');
    } finally {
      setIsCreatingDistrict(false);
    }
  };

  const cancelNewDistrict = () => {
    setShowNewDistrictInput(false);
    setNewDistrict('');
    setDistrictError('');
  };

  const handleCreateCity = async () => {
    if (!newCity.trim()) return;
    setIsCreatingCity(true);
    setCityError('');
    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCity.trim() })
      });
      if (!res.ok) throw new Error('Ошибка при создании города');
      const city = await res.json();
      setCities(prev => [...prev, city]);
      setFormData(prev => ({ ...prev, cityId: city.id }));
      setShowNewCityInput(false);
      setNewCity('');
    } catch {
      setCityError('Ошибка при создании города');
    } finally {
      setIsCreatingCity(false);
    }
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
      
      // Add coordinates if available
      if (coordinates) {
        formDataToSend.append('latitude', coordinates.lat.toString());
        formDataToSend.append('longitude', coordinates.lng.toString());
      }
      
      // Add full address if available
      if (fullAddress) {
        formDataToSend.append('fullAddress', fullAddress);
      }
      
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
        // Try to extract a useful message whatever the response format is
        let message = 'Failed to create listing';
        const contentType = response.headers.get('content-type') || '';
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData.validationErrors && Array.isArray(errorData.validationErrors)) {
              // Build a readable list of field errors
              const details = errorData.validationErrors
                .map((v: { path: string; message: string }) => `${v.path}: ${v.message}`)
                .join('\n');
              message = `${errorData.error || 'Validation error'}\n${details}`;
            } else {
              message = errorData.error || message;
            }
          } else {
            // Fallback to plain text (could be HTML) – strip tags to keep it readable
            const text = await response.text();
            message = text.replace(/<[^>]*>/g, '').trim().split('\n')[0] || message;
          }
        } catch {
          /* ignore parse failures – we'll use the generic message */
        }
        throw new Error(message);
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
                <option value="">Выберите категорию</option>
                {filteredCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {filteredPropertyTypes.length > 0 && (
              <div>
                <label htmlFor="typeId" className="block text-sm font-medium text-gray-700 mb-1">
                  Тип недвижимости *
                </label>
                <select
                  id="typeId"
                  name="typeId"
                  value={formData.typeId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
                  required
                >
                  <option value="">
                    {!formData.categoryId 
                      ? 'Сначала выберите категорию' 
                      : 'Выберите тип недвижимости'}
                  </option>
                  {filteredPropertyTypes.map(propertyType => (
                    <option key={propertyType.id} value={propertyType.id}>
                      {propertyType.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <PriceInput
              id="price"
              name="price"
              value={formData.price}
              onChange={handleValueChange}
              required
              label="Цена"
              suffix={formData.dealType === 'RENT' ? '₽/месяц' : '₽'}
            />
            
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
              <label htmlFor="districtId" className="block text-sm font-medium text-gray-700 mb-1">
                Район
              </label>
              <div className="flex gap-2 items-center">
                <select
                  id="districtId"
                  name="districtId"
                  value={formData.districtId}
                  onChange={e => setFormData(prev => ({ ...prev, districtId: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Выберите район</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => (showNewDistrictInput ? cancelNewDistrict() : setShowNewDistrictInput(true))}
                  className="text-blue-600 underline text-xs"
                >
                  {showNewDistrictInput ? 'Отмена' : 'Добавить район'}
                </button>
              </div>
              {showNewDistrictInput && (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={e => setNewDistrict(e.target.value)}
                    placeholder="Введите название района"
                    className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
                    disabled={isCreatingDistrict}
                  />
                  {districtError && <p className="text-sm text-red-600">{districtError}</p>}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleCreateDistrict}
                      className="px-3 py-1 bg-[#11535F] text-white rounded-md text-sm flex items-center"
                      disabled={isCreatingDistrict}
                    >
                      {isCreatingDistrict ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Создание...
                        </>
                      ) : (
                        'Добавить район'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelNewDistrict}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      disabled={isCreatingDistrict}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                onSelect={(data) => {
                  setFormData(prev => ({ ...prev, address: data.address }));
                  setCoordinates(data.coordinates || null);
                  setFullAddress(data.fullAddress);
                }}
                placeholder="Начните вводить адрес..."
                error={error && error.includes('address') ? 'Введите корректный адрес' : undefined}
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
                <option value="Ремонт от застройщика">Ремонт от застройщика</option>
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
                <option value="MONOLITH_BRICK">Монолит-кирпич</option>
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
            
            <div>
              <label htmlFor="cityId" className="block text-sm font-medium text-gray-700 mb-1">
                Город *
              </label>
              <div className="flex gap-2 items-center">
                <select
                  id="cityId"
                  name="cityId"
                  value={formData.cityId}
                  onChange={e => setFormData(prev => ({ ...prev, cityId: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Выберите город</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowNewCityInput(v => !v)} className="text-blue-600 underline text-xs">{showNewCityInput ? 'Отмена' : 'Добавить город'}</button>
              </div>
              {showNewCityInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="p-2 border rounded w-full"
                    placeholder="Введите новый город"
                  />
                  <button type="button" onClick={handleCreateCity} disabled={isCreatingCity} className="bg-blue-600 text-white px-3 py-1 rounded">{isCreatingCity ? 'Добавление...' : 'Добавить'}</button>
                </div>
              )}
              {cityError && <div className="text-red-500 text-xs mt-1">{cityError}</div>}
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
            <MarkdownToolbar textareaId="publicDescription" />
            <textarea
              id="publicDescription"
              name="publicDescription"
              value={formData.publicDescription}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
            />
            <MarkdownPreview content={formData.publicDescription || ''} />
            <p className="text-xs text-gray-500 mt-1">
              Поддерживает форматирование Markdown: **жирный**, *курсив*, [ссылки](url), - списки, # заголовки
            </p>

            <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Комментарий администратора (не виден пользователям)
            </label>
            <MarkdownToolbar textareaId="adminComment" />
            <textarea
              id="adminComment"
              name="adminComment"
              value={formData.adminComment}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
            />
            <MarkdownPreview content={formData.adminComment || ''} />
            <p className="text-xs text-gray-500 mt-1">
              Поддерживает форматирование Markdown: **жирный**, *курсив*, [ссылки](url), - списки, # заголовки
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-medium">Фотографии</h2>
          </div>
          
          {compressionProgress > 0 && compressionProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${compressionProgress}%` }}></div>
            </div>
          )}
          
          <ImageUpload 
            onImagesSelected={handleImageChange}
            onImageRemoved={removeImage}
            isUploading={Object.keys(uploadingImages).length > 0}
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