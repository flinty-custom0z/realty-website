'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminImagePreview from '@/components/AdminImagePreview';
import ImageModal from '@/components/ImageModal';
import { Loader2, ArrowLeft } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import Button from '@/components/Button';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { createLogger } from '@/lib/logging';
import PriceInput from '@/components/ui/PriceInput';
import MarkdownToolbar from '@/components/admin/MarkdownToolbar';
import MarkdownPreview from '@/components/admin/MarkdownPreview';
import { compressImage, CompressionOptions } from '@/lib/utils/imageOptimization';

interface ListingFormData {
  publicDescription: string,
  adminComment: string,
  categoryId: string;
  district: string;
  districtId: string;
  typeId: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  fullAddress?: string | null;
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
  cityId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
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
  propertyType?: {
    id: string;
    name: string;
  };
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

// Create a logger instance
const logger = createLogger('AdminListingEditPage');

const COMPRESSION_CONFIG: CompressionOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
  maxSizeKB: 1024,
  outputFormat: 'jpeg',
};

export default function EditListingPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [filteredPropertyTypes, setFilteredPropertyTypes] = useState<{ id: string; name: string; categoryId: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // For image uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string>('');
  
  // Add state for tracking individual image upload status
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  
  // Add district-related state
  const [districts, setDistricts] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [showNewDistrictInput, setShowNewDistrictInput] = useState(false);
  const [newDistrict, setNewDistrict] = useState('');
  const [isCreatingDistrict, setIsCreatingDistrict] = useState(false);
  const [districtError, setDistrictError] = useState('');
  
  // Add a resetKey to force ImageUpload component to reset
  const [resetKey, setResetKey] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState<ListingFormData & { userId?: string }>({
    publicDescription: '',
    adminComment: '',
    categoryId: '',
    district: '',
    districtId: '',
    typeId: '',
    address: '',
    latitude: null,
    longitude: null,
    fullAddress: null,
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
  
  // Add new state for image preview modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState('');
  
  // Ref for clearing file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add city-related state
  const [cities, setCities] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [showNewCityInput, setShowNewCityInput] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [isCreatingCity, setIsCreatingCity] = useState(false);
  const [cityError, setCityError] = useState('');
  
  // Add compression progress state
  const [compressionProgress, setCompressionProgress] = useState<number>(0);
  
  // Fetch users (realtors) and listing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if params and id exist
        if (!params || !params.id) {
          setError('Invalid listing ID');
          setIsLoading(false);
          return;
        }
        
        // Fetch users - still needed for backwards compatibility
        const usersRes = await fetch('/api/admin/users');
        const usersData = usersRes.ok ? await usersRes.json() : [];
        
        // Fetch listing
        const listingRes = await fetch(`/api/admin/listings/${params.id}`);
        if (!listingRes.ok) {
          throw new Error('Failed to fetch listing');
        }
        const listingData = await listingRes.json();
        setListing(listingData);
        
        // Set form data
        setFormData({
          publicDescription: listingData.publicDescription || '',
          adminComment: listingData.adminComment || '',
          categoryId: listingData.categoryId,
          district: listingData.district || '',
          districtId: listingData.districtId || '',
          typeId: listingData.typeId || '',
          address: listingData.address || '',
          latitude: listingData.latitude,
          longitude: listingData.longitude,
          fullAddress: listingData.fullAddress,
          floor: listingData.floor?.toString() || '',
          totalFloors: listingData.totalFloors?.toString() || '',
          houseArea: listingData.houseArea?.toString() || '',
          kitchenArea: listingData.kitchenArea?.toString() || '',
          landArea: listingData.landArea?.toString() || '',
          condition: listingData.condition || '',
          yearBuilt: listingData.yearBuilt?.toString() || '',
          buildingType: listingData.buildingType || '',
          balconyType: listingData.balconyType || '',
          bathroomType: listingData.bathroomType || '',
          windowsView: listingData.windowsView || '',
          noEncumbrances: listingData.noEncumbrances || false,
          noShares: listingData.noShares || false,
          price: listingData.price.toString(),
          dealType: listingData.dealType || 'SALE',
          status: listingData.status,
          userId: listingData.user?.id || (usersData[0]?.id ?? ''),
          cityId: listingData.cityId || '',
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
        
        // Filter categories based on deal type
        if (listingData.dealType === 'RENT') {
          const allowedSlugs = ['apartments', 'commercial'];
          const filtered = categoriesData.filter((category: Category) => 
            allowedSlugs.includes(category.slug)
          );
          setFilteredCategories(filtered);
        } else {
          setFilteredCategories(categoriesData);
        }
        
        // Fetch property types
        const propertyTypesRes = await fetch('/api/admin/property-types');
        if (!propertyTypesRes.ok) {
          throw new Error('Failed to fetch property types');
        }
        const propertyTypesData = await propertyTypesRes.json();
        setPropertyTypes(propertyTypesData);
        
        // Filter property types based on category
        const filteredTypes = propertyTypesData.filter(
          (pt: { id: string; name: string; categoryId: string }) => pt.categoryId === listingData.categoryId
        );
        setFilteredPropertyTypes(filteredTypes);
        
        // Fetch districts
        const districtsRes = await fetch('/api/districts');
        if (!districtsRes.ok) {
          throw new Error('Failed to fetch districts');
        }
        const districtsData = await districtsRes.json();
        setDistricts(districtsData);
        
        // Fetch cities
        const citiesRes = await fetch('/api/cities');
        if (!citiesRes.ok) throw new Error('Failed to fetch cities');
        const citiesData = await citiesRes.json();
        setCities(citiesData);
      } catch (error) {
        logger.error('Error fetching data:', { error });
        setError('Failed to load listing data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params?.id]);
  
  // Reset image previews when listing is updated
  useEffect(() => {
    // Clear local image previews when listing is updated 
    // This ensures uploaded images don't continue showing in the pending uploads area
    if (listing) {
      // Clean up any existing object URLs to prevent memory leaks
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      
      // Completely reset the image upload states
      setImagePreviews([]);
      setImageFiles([]);
      setUploadingImages({});
      
      // Also ensure the file input is cleared
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [listing?.images]);
  
  // Filter categories based on deal type
  useEffect(() => {
    if (categories.length === 0) return;
    
    if (formData.dealType === 'RENT') {
      const allowedSlugs = ['apartments', 'commercial'];
      const filtered = categories.filter(category => 
        allowedSlugs.includes(category.slug)
      );
      setFilteredCategories(filtered);
      
      // If current category is not in allowed list, update to first allowed category
      const currentCategorySlug = categories.find(c => c.id === formData.categoryId)?.slug;
      if (currentCategorySlug && !allowedSlugs.includes(currentCategorySlug) && filtered.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: filtered[0].id }));
      }
    } else {
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
      logger.error('Error deleting listing', { error });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    try {
      // Check if params.id exists
      if (!params || !params.id) {
        throw new Error('Invalid listing ID');
      }
      
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
        try {
          // Create a tracking object with all images set to uploading
          const imageUploadStatus: Record<string, boolean> = {};
          imageFiles.forEach((file, index) => {
            try {
              const imageId = `${file.name}-${index}`;
              imageUploadStatus[imageId] = true;
              
              // Validate file before adding to form data
              if (file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                formDataToSend.append('newImages', file);
              } else {
                logger.warn(`Skipping invalid file type: ${file.type} for ${file.name}`);
              }
            } catch (fileError) {
              logger.error(`Error adding file to form data: ${file.name}`, { fileError });
            }
          });
          setUploadingImages(imageUploadStatus);
        } catch (error) {
          logger.error('Error preparing image uploads:', { error });
        }
      }
      
      const response = await fetch(`/api/admin/listings/${params.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        // Attempt to extract an error message regardless of response format
        let message = 'Failed to update listing';
        const contentType = response.headers.get('content-type') || '';
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData.validationErrors && Array.isArray(errorData.validationErrors)) {
              const details = errorData.validationErrors
                .map((v: { path: string; message: string }) => `${v.path}: ${v.message}`)
                .join('\n');
              message = `${errorData.error || 'Validation error'}\n${details}`;
            } else {
              message = errorData.error || message;
            }
          } else {
            const text = await response.text();
            message = text.replace(/<[^>]*>/g, '').trim().split('\n')[0] || message;
          }
        } catch {
          /* ignore parse failures */
        }
        throw new Error(message);
      }
      
      // Reset the image upload tracking  
      setUploadingImages({});
      
      // Clean up any object URLs to prevent memory leaks
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      
      // Clear temporary image states
      setImageFiles([]);
      setImagePreviews([]);
      setImagesToDelete([]);
      
      // Force ImageUpload component to reset
      setResetKey(prev => prev + 1);
      
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
      logger.error('Error updating listing:', { error });
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
                className="w-full p-2 border rounded"
                required
              >
                <option value="active">Активно</option>
                <option value="inactive">Неактивно</option>
              </select>
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
                onChange={(value) => setFormData({ ...formData, address: value })}
                onSelect={(data) => {
                  setFormData({
                    ...formData,
                    address: data.address,
                    fullAddress: data.fullAddress,
                  });
                }}
                placeholder="Начните вводить адрес..."
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                Введите адрес для автозаполнения координат и полного адреса
              </p>
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
          
          <div className="mt-6">
            <label htmlFor="publicDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Описание (публичное)
            </label>
            <MarkdownToolbar textareaId="publicDescription" />
            <textarea
              id="publicDescription"
              name="publicDescription"
              value={formData.publicDescription}
              onChange={(e) => setFormData({ ...formData, publicDescription: e.target.value })}
              rows={6}
              className="w-full p-2 border rounded"
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
              onChange={(e) => setFormData({ ...formData, adminComment: e.target.value })}
              rows={6}
              className="w-full p-2 border rounded"
            />
            <MarkdownPreview content={formData.adminComment || ''} />
            <p className="text-xs text-gray-500 mt-1">
              Поддерживает форматирование Markdown: **жирный**, *курсив*, [ссылки](url), - списки, # заголовки
            </p>
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
                  isUploading={Object.keys(uploadingImages).length > 0}
                  uploadingImages={uploadingImages}
                  previewModalHandler={openPreviewModal}
                  resetKey={resetKey}
                />
              </div>
            </div>
          </div>
          
          {compressionProgress > 0 && compressionProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${compressionProgress}%` }}></div>
            </div>
          )}
          
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
          onClose={closePreviewModal}
        />
      )}
    </div>
  );
}