'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from './Button';

interface User {
  id: string;
  name: string;
  username: string;
}

export default function AdminNavClient() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by making a request to the server
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check', {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-400 text-sm">
        <span className="animate-pulse">•••</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center my-2">
      {user ? (
        <div className="flex items-center space-x-3">
          <Link 
            href="/admin" 
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <span className="mr-1">👤</span> 
            <span>{user.name}</span>
            <span className="mx-1">|</span>
            <span>Админ панель</span>
          </Link>
          
          <Button
            onClick={handleLogout}
            variant="primary"
            className="text-sm bg-red-600 hover:bg-red-700 border-red-600"
          >
            Выйти
          </Button>
        </div>
      ) : (
        <Link 
          href="/admin-login"
          className="text-gray-600 hover:text-gray-900 text-sm flex items-center"
        >
          <span className="mr-1">🔐</span> 
          Вход для администраторов
        </Link>
      )}
    </div>
  );
}