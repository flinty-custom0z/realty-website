import Link from 'next/link';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { Home, Building2, MapPin, Store, ListFilter, PlusCircle } from 'lucide-react';
import { JWT_SECRET } from '@/lib/env';
import AdminNavMenu from '@/components/AdminNavMenu';

async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, username: true },
    });
    
    return user;
  } catch {
    return null;
  }
}

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
  const [stats, user] = await Promise.all([
    getDashboardStats(),
    getUserFromCookie(),
  ]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div>
      <AdminNavMenu userName={user.name} />
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Панель управления</h1>
        <Link 
          href="/admin/listings/new" 
            className="inline-flex items-center justify-center px-4 py-2 bg-[#11535F] text-white rounded-[8px] text-sm font-medium hover:bg-[#0D454F] transition-all duration-200 shadow-sm"
        >
          <PlusCircle size={16} className="mr-2" />
          Добавить объявление
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Всего объявлений</h2>
          <p className="text-3xl font-bold text-[#11535F]">{stats.totalListings}</p>
          <div className="mt-2 text-sm text-gray-500">
            <ListFilter size={16} className="inline-block mr-1" />
            <span>Все объявления на сайте</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Активных объявлений</h2>
          <p className="text-3xl font-bold text-green-600">{stats.activeListings}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span>Видны посетителям сайта</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Категории</h2>
          <p className="text-3xl font-bold text-[#505050]">{stats.listingsByCategory.length}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span>Типы недвижимости</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium">Объявления по категориям</h2>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-medium text-gray-700 pl-2">Категория</th>
                  <th className="pb-3 font-medium text-gray-700 text-right pr-2">Количество</th>
                </tr>
              </thead>
              <tbody>
                {stats.listingsByCategory.map((category) => {
                  let icon;
                  switch(category.slug) {
                    case 'apartments':
                      icon = <Building2 size={16} className="text-blue-500 mr-2" />;
                      break;
                    case 'houses':
                      icon = <Home size={16} className="text-amber-600 mr-2" />;
                      break;
                    case 'land':
                      icon = <MapPin size={16} className="text-green-600 mr-2" />;
                      break;
                    case 'commercial':
                      icon = <Store size={16} className="text-indigo-600 mr-2" />;
                      break;
                    default:
                      icon = <ListFilter size={16} className="text-gray-500 mr-2" />;
                  }
                  
                  return (
                    <tr key={category.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-3 pl-2 flex items-center">
                        {icon}
                        {category.name}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <span className="font-medium">{category._count.listings}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}