'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListFilter, Users, BarChart, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  userName: string;
}

export default function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <aside className="hidden md:block w-64 lg:w-72 bg-white shadow-sm h-screen sticky top-0 p-4 lg:p-6 overflow-y-auto">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl font-bold text-gray-800">Админ панель</h1>
        <p className="text-sm text-gray-500 mt-1">Привет, {userName}</p>
      </div>
      
      <nav className="space-y-1">
        <Link 
          href="/admin" 
          className={`flex items-center py-2 lg:py-3 px-3 lg:px-4 rounded-md ${
            isActive('/admin') && !isActive('/admin/listings') && !isActive('/admin/users') && !isActive('/admin/monitoring')
              ? 'bg-gray-100 font-medium text-[#11535F]' 
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <LayoutDashboard className={`h-5 w-5 mr-3 ${
            isActive('/admin') && !isActive('/admin/listings') && !isActive('/admin/users') && !isActive('/admin/monitoring')
              ? 'text-[#11535F]' 
              : 'text-gray-500'
          }`} />
          <span>Главная</span>
        </Link>
        
        <Link 
          href="/admin/listings" 
          className={`flex items-center py-2 lg:py-3 px-3 lg:px-4 rounded-md ${
            isActive('/admin/listings')
              ? 'bg-gray-100 font-medium text-[#11535F]' 
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <ListFilter className={`h-5 w-5 mr-3 ${
            isActive('/admin/listings')
              ? 'text-[#11535F]' 
              : 'text-gray-500'
          }`} />
          <span>Объявления</span>
        </Link>
        
        <Link 
          href="/admin/users" 
          className={`flex items-center py-2 lg:py-3 px-3 lg:px-4 rounded-md ${
            isActive('/admin/users')
              ? 'bg-gray-100 font-medium text-[#11535F]' 
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Users className={`h-5 w-5 mr-3 ${
            isActive('/admin/users')
              ? 'text-[#11535F]' 
              : 'text-gray-500'
          }`} />
          <span>Пользователи</span>
        </Link>
        
        <Link 
          href="/admin/monitoring" 
          className={`flex items-center py-2 lg:py-3 px-3 lg:px-4 rounded-md ${
            isActive('/admin/monitoring')
              ? 'bg-gray-100 font-medium text-[#11535F]' 
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <BarChart className={`h-5 w-5 mr-3 ${
            isActive('/admin/monitoring')
              ? 'text-[#11535F]' 
              : 'text-gray-500'
          }`} />
          <span>Мониторинг</span>
        </Link>
      </nav>
      
      <div className="pt-4 mt-6 border-t border-gray-100">
        <Link 
          href="/admin/logout" 
          className="flex items-center py-2 lg:py-3 px-3 lg:px-4 rounded-md hover:bg-gray-50 text-gray-700"
        >
          <LogOut className="h-5 w-5 mr-3 text-gray-500" />
          <span>Выйти</span>
        </Link>
      </div>
    </aside>
  );
} 