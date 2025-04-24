'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import SearchParamsProvider from '@/components/SearchParamsProvider';
import Button from '@/components/Button';

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleLogin = async (e: FormEvent, redirectTo: string = '/admin') => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, rememberMe }),
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
          <form onSubmit={(e) => handleLogin(e, redirectTo)} className="p-6 bg-white rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-center">Вход в административную панель</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="form-field">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  placeholder="Введите имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-field">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-icon"></span>
                  <span className="text-sm text-gray-700 ml-2">Запомнить меня</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                fullWidth
              >
                {isLoading ? 'Выполняется вход...' : 'Войти'}
              </Button>
            </div>
          </form>
        );
      }}
    </SearchParamsProvider>
  );
}