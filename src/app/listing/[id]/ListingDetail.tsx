// Server component that renders listing details
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate, formatPrice } from '@/lib/utils';
import ListingInteractiveClient from './ListingInteractiveClient';
import ImageGallery from '@/components/ImageGallery';
import ListingMapClient from '@/components/ListingMapClient';

interface ListingImage {
  path: string;
  isFeatured: boolean;
  id?: string;
}

interface Listing {
  id: string;
  title: string;
  dateAdded: Date;
  price: number;
  images: ListingImage[];
  address?: string;
  floor?: number;
  totalFloors?: number;
  houseArea?: number;
  landArea?: number;
  yearBuilt?: number;
  condition?: string;
  listingCode: string;
  publicDescription?: string;
  adminComment?: string;
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
  districtRef?: {
    name: string;
  };
  district?: string;
  propertyType?: {
    name: string;
  };
  city?: {
    name: string;
  };
}

interface ListingDetailProps {
  listing: Listing;
  isAdmin: boolean;
}

export default function ListingDetail({ listing, isAdmin }: ListingDetailProps) {
  const formattedDate = formatDate(listing.dateAdded);
  
  // Ensure main image is first and add id for ImageGallery
  const sortedImages = listing.images.slice().sort((a, b) => {
    if (a.isFeatured === b.isFeatured) return 0;
    return a.isFeatured ? -1 : 1;
  }).map((img, index) => ({
    ...img,
    id: img.id || `img-${index}` // Ensure each image has an id
  }));

  // Get district name from either string or object
  const districtName = listing.districtRef 
    ? listing.districtRef.name 
    : (typeof listing.district === 'string' ? listing.district : null);

  // Import DangerZone dynamically in case ListingInteractiveClient doesn't have it properly attached
  const DangerZone = ListingInteractiveClient.DangerZone;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* top bar */}
      <div className="flex justify-between items-center mb-4">
        <Link href="/" className="text-[#11535F] hover:underline transition-all duration-200 flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          На главную
        </Link>
        
        {/* Admin buttons rendered client-side */}
        {isAdmin && <ListingInteractiveClient listingId={listing.id} />}
      </div>
      
      {/* title & gallery */}
      <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
      <ImageGallery images={sortedImages} title={listing.title} />
      
      <div className="flex justify-between items-center my-4">
        <p className="text-gray-500">Добавлено: {formattedDate}</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* left column */}
        <div className="w-full md:w-2/3">
          {/* characteristics */}
          <section className="bg-white shadow rounded-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Характеристики объекта</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                {districtName && <p className="mb-2"><span className="text-gray-600">Район:</span> {districtName}</p>}
                {listing.address && <p className="mb-2"><span className="text-gray-600">Адрес:</span> {listing.address}</p>}
                {listing.floor && listing.totalFloors && 
                  <p className="mb-2"><span className="text-gray-600">Этаж:</span> {listing.floor}/{listing.totalFloors}</p>
                }
                {listing.houseArea && <p className="mb-2"><span className="text-gray-600">Площадь (м²):</span> {listing.houseArea}</p>}
                {listing.landArea && <p className="mb-2"><span className="text-gray-600">Площадь участка (сот.):</span> {listing.landArea}</p>}
                <p className="mb-2"><span className="text-gray-600">Цена:</span> {formatPrice(listing.price)}</p>
              </div>
              <div>
                {listing.yearBuilt && <p className="mb-2"><span className="text-gray-600">Год:</span> {listing.yearBuilt}</p>}
                {listing.condition && <p className="mb-2"><span className="text-gray-600">Состояние:</span> {listing.condition}</p>}
                <p className="mb-2"><span className="text-gray-600">Код объекта:</span> {listing.listingCode}</p>
                <p className="mb-2"><span className="text-gray-600">Дата добавления:</span> {formattedDate}</p>
              </div>
            </div>
          </section>
           
          {/* Map section */}
          {listing.latitude && listing.longitude && (
            <ListingMapClient
              longitude={listing.longitude}
              latitude={listing.latitude}
              propertyType={listing.propertyType?.name}
              listingId={listing.id}
              fullAddress={listing.fullAddress}
            />
          )}
          
          {/* public description */}
          {listing.publicDescription && (
            <section className="bg-white shadow rounded-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Описание</h2>
              <div className="prose max-w-none text-gray-800">
                {listing.publicDescription.split('\n').map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}
          
          {/* admin comment */}
          {listing.adminComment && (
            <section className="admin-comment mb-6">
              <div className="admin-comment-header">
                <svg className="admin-comment-lock" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <h2 className="text-xl font-bold">Комментарий администратора</h2>
              </div>
              <div className="prose max-w-none text-gray-700">
                {listing.adminComment.split('\n').map((p: string, i: number) => (
                  <p key={i} className="mb-4">
                    {p}
                  </p>
                ))}
              </div>
              <p className="admin-comment-notice">
                Этот комментарий виден только администраторам
              </p>
            </section>
          )}
          
          {/* Delete button section - only visible to admins */}
          {isAdmin && DangerZone && (
            <div id="admin-danger-zone">
              <DangerZone listingId={listing.id} />
            </div>
          )}
        </div>
        
        {/* right sidebar - contact information */}
        <aside className="w-full md:w-1/3">
          <div className="bg-white shadow rounded-md p-6 sticky top-4">
            <h3 className="font-bold text-lg mb-4">Контактная информация</h3>
            <div className="border-t pt-4 text-sm">
              <div className="contact-card-item mb-4">
                <a href="tel:+79624441579" className="flex items-center group mb-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 mr-3 group-hover:bg-blue-100 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">Ирина</span>
                    <span className="block text-gray-700 group-hover:text-blue-500 transition-all duration-200">
                      +7-962-444-15-79
                    </span>
                  </div>
                </a>
              </div>
              
              <div className="contact-card-item">
                <a href="tel:+79097725578" className="flex items-center group">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 mr-3 group-hover:bg-blue-100 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">Татьяна</span>
                    <span className="block text-gray-700 group-hover:text-blue-500 transition-all duration-200">
                      +7-909-772-55-78
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
} 