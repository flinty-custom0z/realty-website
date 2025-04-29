'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from './Button';
import { User, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
}

export default function AdminNavClient() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
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

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (res.ok) {
        // Redirect to home page after logout
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  if (isLoading) {
    return null;
  }

  return (
    <div className="flex items-center justify-center my-2">
      {user ? (
        <div className="flex items-center space-x-3">
          <Link 
            href="/admin" 
            className="text-[#11535F] hover:text-[#0D454F] text-sm flex items-center transition-colors duration-200"
          >
            <User size={16} className="mr-1" /> 
            <span>{user.name}</span>
            <span className="mx-1">|</span>
            <span>Админ панель</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="admin-logout-btn flex items-center"
          >
            <LogOut size={14} className="mr-1" />
            Выйти
          </button>
        </div>
      ) : (
        <Link 
          href="/admin-login"
          className="text-gray-600 hover:text-gray-900 text-sm flex items-center transition-colors duration-200"
        >
          <User size={16} className="mr-1" /> 
          Вход для администраторов
        </Link>
      )}
    </div>
  );
}