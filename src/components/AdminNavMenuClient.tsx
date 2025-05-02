'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListFilter, Users, BarChart, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
}

export default function AdminNavMenuClient() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/check');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  if (isLoading || !user) {
    return <div className="h-16 animate-pulse bg-gray-100 rounded-lg mb-8"></div>;
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Админ панель</h1>
        <p className="text-sm text-gray-500 mt-1">Привет, {user.name}</p>
      </div>
      
      <div className="space-y-2">
        <Link 
          href="/admin" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/admin') && !isActive('/admin/listings') && !isActive('/admin/users') && !isActive('/admin/monitoring')
              ? 'bg-gray-100 font-medium' 
              : 'hover:bg-gray-50'
          }`}
        >
          <LayoutDashboard className="h-5 w-5 mr-3 text-gray-500" />
          <span>Главная</span>
        </Link>
        
        <Link 
          href="/admin/listings" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/admin/listings')
              ? 'bg-gray-100 font-medium' 
              : 'hover:bg-gray-50'
          }`}
        >
          <ListFilter className="h-5 w-5 mr-3 text-gray-500" />
          <span>Объявления</span>
        </Link>
        
        <Link 
          href="/admin/users" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/admin/users')
              ? 'bg-gray-100 font-medium' 
              : 'hover:bg-gray-50'
          }`}
        >
          <Users className="h-5 w-5 mr-3 text-gray-500" />
          <span>Пользователи</span>
        </Link>
        
        <Link 
          href="/admin/monitoring" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/admin/monitoring')
              ? 'bg-gray-100 font-medium' 
              : 'hover:bg-gray-50'
          }`}
        >
          <BarChart className="h-5 w-5 mr-3 text-gray-500" />
          <span>Мониторинг</span>
        </Link>
        
        <div className="pt-4 mt-6 border-t border-gray-100">
          <Link 
            href="/admin/logout" 
            className="flex items-center py-3 px-4 rounded-md hover:bg-gray-50"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-500" />
            <span>Выйти</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 