'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <div className="flex items-center">
      {user ? (
        <div className="flex items-center space-x-3">
          <Link 
            href="/admin" 
            className="text-blue-600 hover:text-blue-800 text-sm md:text-base flex items-center whitespace-nowrap"
          >
            <span className="hidden md:inline mr-1">👤</span> 
            <span className="hidden md:inline">{user.name}</span>
            <span className="md:hidden">Админ</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 text-sm md:text-base"
          >
            Выйти
          </button>
        </div>
      ) : (
        <Link 
          href="/admin-login"
          className="text-gray-600 hover:text-gray-900 text-sm md:text-base flex items-center"
        >
          <span className="hidden md:inline mr-1">🔐</span> 
          Админ
        </Link>
      )}
    </div>
  );
}