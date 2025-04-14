import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getDashboardStats() {
  const [
    totalListings,
    activeListings,
    listingsByCategory,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { listings: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);
  
  return {
    totalListings,
    activeListings,
    listingsByCategory,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Панель управления</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-700">Всего объявлений</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalListings}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-700">Активных объявлений</h2>
          <p className="text-3xl font-bold mt-2">{stats.activeListings}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-700">Категории</h2>
          <p className="text-3xl font-bold mt-2">{stats.listingsByCategory.length}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Объявления по категориям</h2>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 font-medium">Категория</th>
                  <th className="pb-3 font-medium text-right">Количество</th>
                </tr>
              </thead>
              <tbody>
                {stats.listingsByCategory.map((category) => (
                  <tr key={category.id} className="border-b last:border-0">
                    <td className="py-3">{category.name}</td>
                    <td className="py-3 text-right">{category._count.listings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Link
          href="/admin/listings/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Добавить объявление
        </Link>
      </div>
    </div>
  );
}