'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, ListFilter, Users, BarChart, LogOut } from 'lucide-react';

interface AdminMobileNavProps {
  userName: string;
}

export default function AdminMobileNav({ userName }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Админ панель</h1>
          <p className="text-sm text-gray-500">Привет, {userName}</p>
        </div>
        <button 
          onClick={toggleMenu}
          className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-50"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`
        fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-16 px-6
      `}>
        <button 
          onClick={toggleMenu}
          className="absolute top-4 right-4 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-50"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Админ панель</h1>
          <p className="text-sm text-gray-500 mt-1">Привет, {userName}</p>
        </div>
        
        <nav className="space-y-2">
          <Link 
            href="/admin" 
            onClick={toggleMenu}
            className={`flex items-center py-4 px-4 rounded-md ${
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
            onClick={toggleMenu}
            className={`flex items-center py-4 px-4 rounded-md ${
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
            onClick={toggleMenu}
            className={`flex items-center py-4 px-4 rounded-md ${
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
            onClick={toggleMenu}
            className={`flex items-center py-4 px-4 rounded-md ${
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
          
          <div className="pt-4 mt-6 border-t border-gray-100">
            <Link 
              href="/admin/logout" 
              onClick={toggleMenu}
              className="flex items-center py-4 px-4 rounded-md hover:bg-gray-50 text-gray-700"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              <span>Выйти</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
} 