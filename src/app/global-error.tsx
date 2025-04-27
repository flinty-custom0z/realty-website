'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function GlobalError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void 
}) {
  return (
    <html lang="ru">
      <body>
        <ErrorBoundary error={error} reset={reset} />
      </body>
    </html>
  );
} 