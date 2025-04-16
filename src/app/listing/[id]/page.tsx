import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ImageGallery from '@/components/ImageGallery';

const prisma = new PrismaClient();

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      images: true,
    },
  });
  
  return listing;
}

export default async function ListingDetailPage({ params }: { params: any }) {
  const listing = await getListing(params.id);
  
  if (!listing) {
    notFound();
  }
  
  // Format date
  const dateAdded = new Date(listing.dateAdded).toLocaleDateString('ru-RU');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href={`/listing-category/${listing.category.slug}`} className="text-blue-500 hover:underline">
          Детали
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">{listing.title}</h1>
      
      {/* Updated Image Gallery Component */}
      <ImageGallery images={listing.images} title={listing.title} />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <div className="bg-white shadow rounded-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Характеристики объекта</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="mb-2"><span className="text-gray-600">Район:</span> {listing.district || 'Не указан'}</p>
                {listing.rooms && <p className="mb-2"><span className="text-gray-600">Комнат:</span> {listing.rooms}</p>}
                {listing.floor && listing.totalFloors && (
                  <p className="mb-2"><span className="text-gray-600">Этаж:</span> {listing.floor}/{listing.totalFloors}</p>
                )}
                {listing.houseArea && (
                  <p className="mb-2"><span className="text-gray-600">Площадь:</span> {listing.houseArea} м²</p>
                )}
                {listing.landArea && (
                  <p className="mb-2"><span className="text-gray-600">Площадь участка:</span> {listing.landArea} сот.</p>
                )}
                <p className="mb-2"><span className="text-gray-600">Цена:</span> {listing.price.toLocaleString()} ₽</p>
              </div>
              <div>
                {listing.yearBuilt && (
                  <p className="mb-2"><span className="text-gray-600">Год:</span> {listing.yearBuilt}</p>
                )}
                {listing.condition && (
                  <p className="mb-2"><span className="text-gray-600">Состояние:</span> {listing.condition}</p>
                )}
                <p className="mb-2"><span className="text-gray-600">Код объекта:</span> {listing.listingCode}</p>
                <p className="mb-2"><span className="text-gray-600">Дата добавления:</span> {dateAdded}</p>
              </div>
            </div>
          </div>
          
          {/* Public Description */}
          {listing.publicDescription && (
            <div className="bg-white shadow rounded-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Комментарий</h2>
              <div className="prose max-w-none">
                {listing.publicDescription.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar - Agent info */}
        <div className="w-full md:w-1/3">
          <div className="bg-white shadow rounded-md p-6 sticky top-4">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-3xl text-blue-500">{listing.user.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-bold">{listing.user.name}</h3>
                <p className="text-gray-600">Риелтор</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="mb-2 flex items-center">
                <span className="mr-2">📱</span>
                <a href={`tel:${listing.user.phone}`} className="text-blue-500 hover:underline">
                  {listing.user.phone}
                </a>
              </p>
              <p className="text-sm text-gray-500">Позвонить: {listing.user.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}