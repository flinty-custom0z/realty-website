'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

export function ErrorTest() {
  const [errorType, setErrorType] = useState<string>('js-error');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const testError = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      switch (errorType) {
        case 'js-error':
          // JavaScript error
          throw new Error('Test JavaScript error from monitoring dashboard');
        
        case 'api-error':
          // API error
          const response = await fetch('/api/system/test-error');
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          const data = await response.json();
          setResult({ success: true, message: 'API error test completed' });
          break;
          
        case 'sentry-error':
          // Direct Sentry error
          Sentry.captureException(new Error('Test Sentry error from monitoring dashboard'));
          Sentry.captureMessage('Test Sentry message from monitoring dashboard', 'error');
          setResult({ success: true, message: 'Sentry error reported successfully' });
          break;
          
        case 'promise-rejection':
          // Unhandled promise rejection
          await Promise.reject(new Error('Test unhandled promise rejection'));
          break;
          
        default:
          setResult({ success: false, message: 'Invalid error type' });
      }
    } catch (error) {
      console.error('Error test:', error);
      setResult({ 
        success: true, 
        message: `Error triggered: ${error instanceof Error ? error.message : String(error)}` 
      });
      
      // Send to Sentry
      Sentry.captureException(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-medium">Error Testing</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Test error logging and monitoring by triggering different types of errors.
        This is useful for verifying that your error tracking system is working properly.
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row mb-4">
        <select
          className="px-3 py-2 border rounded-md text-sm"
          value={errorType}
          onChange={(e) => setErrorType(e.target.value)}
        >
          <option value="js-error">JavaScript Error</option>
          <option value="api-error">API Error</option>
          <option value="sentry-error">Direct Sentry Report</option>
          <option value="promise-rejection">Unhandled Promise</option>
        </select>
        
        <button
          onClick={testError}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md text-sm hover:bg-yellow-200 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Error'}
        </button>
      </div>
      
      {result && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.message}
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Note: All errors are safely caught and sent to monitoring. No actual application disruption will occur.</p>
      </div>
    </div>
  );
} 