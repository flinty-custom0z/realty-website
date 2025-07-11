import prisma from '@/lib/prisma';
import Link from 'next/link';
import MapWrapper from '@/components/MapWrapper';

export default async function MapPage() {
  // Fetch all active listings with coordinates
  const listings = await prisma.listing.findMany({
    where: {
      status: 'active',
      latitude: { not: null },
      longitude: { not: null }
    },
    select: {
      id: true,
      title: true,
      price: true,
      latitude: true,
      longitude: true,
      address: true,
      propertyType: {
        select: { name: true }
      },
      images: {
        where: { isFeatured: true },
        take: 1,
        select: { path: true }
      }
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Все объекты на карте</h1>
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Вернуться к списку
        </Link>
      </div>
      
      <MapWrapper listings={listings} />
    </div>
  );
} 