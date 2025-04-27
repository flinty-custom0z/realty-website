'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Send error to Sentry
    Sentry.captureException(error);
    
    // Log client-side error to console
    console.error('Application error:', error);
  }, [error]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Что-то пошло не так</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Произошла ошибка при загрузке страницы. Наша команда уже получила уведомление 
          об этой проблеме и работает над её устранением.
        </p>
        
        {process.env.NODE_ENV !== 'production' && (
          <div className="mb-6 p-4 bg-gray-100 rounded overflow-auto max-h-40">
            <p className="text-sm font-mono text-gray-800">{error.message}</p>
            {error.stack && (
              <pre className="text-xs font-mono text-gray-600 mt-2">{error.stack}</pre>
            )}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            На главную
          </button>
          
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  );
} 