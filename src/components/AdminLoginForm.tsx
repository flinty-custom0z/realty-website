'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import SearchParamsProvider from '@/components/SearchParamsProvider';

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: FormEvent, redirectTo: string = '/admin') => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      // Redirect to admin dashboard or the specified redirect URL (full reload)
      window.location.href = redirectTo;
    } catch (err) {
      setError((err as Error).message || 'Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SearchParamsProvider>
      {(searchParams) => {
        const redirectTo = searchParams?.get('redirect') || '/admin';
        
        return (
          <form onSubmit={(e) => handleLogin(e, redirectTo)} className="p-6 bg-white rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">Вход в административную панель</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Имя пользователя
        </label>
        <input
          id="username"
          type="text"
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Введите имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:bg-blue-300"
      >
        {isLoading ? 'Выполняется вход...' : 'Войти'}
      </button>
    </form>
  );
      }}
    </SearchParamsProvider>
  );
}