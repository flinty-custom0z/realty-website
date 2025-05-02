'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from './Button';
import { 
  LayoutDashboard, 
  ListFilter, 
  PlusCircle, 
  Users,
  LogOut,
  BarChart
} from 'lucide-react';

export default function AdminSidebar({ user }: { user: { name: string } }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-medium text-gray-800">Админ панель</h2>
        <p className="text-sm text-gray-500 mt-1">Привет, {user.name}</p>
      </div>
      <nav className="p-4">
        <div className="space-y-1">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
              isActive('/admin') && !isActive('/admin/listings') && !isActive('/admin/users') && !isActive('/admin/monitoring')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Главная</span>
          </Link>
          
          <Link 
            href="/admin/listings" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
              isActive('/admin/listings') && !isActive('/admin/listings/new')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ListFilter size={18} />
            <span>Объявления</span>
          </Link>
          
          <Link 
            href="/admin/listings/new" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
              isActive('/admin/listings/new')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <PlusCircle size={18} />
            <span>Добавить объявление</span>
          </Link>
          
          <Link 
            href="/admin/users" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
              isActive('/admin/users')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users size={18} />
            <span>Риелторы</span>
          </Link>
          
          <Link 
            href="/admin/monitoring" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
              isActive('/admin/monitoring')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart size={18} />
            <span>Мониторинг</span>
          </Link>
        </div>
        
        <div className="border-t border-gray-100 pt-4 mt-6">
          <button
            type="button"
            onClick={() => window.location.href = '/admin/logout'}
            className="admin-logout-btn w-full flex items-center justify-start mt-2 text-sm"
          >
            <LogOut size={16} className="mr-2" />
            Выйти
          </button>
        </div>
      </nav>
    </aside>
  );
} 