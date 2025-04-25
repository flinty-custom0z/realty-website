// Server component
import React, { Suspense } from 'react';
import ThemeDemoClient from './theme-demo-client';

export const dynamic = 'force-dynamic';

export default function ThemeDemoPage() {
  return (
    <Suspense fallback={<div>Loading theme demo...</div>}>
      <ThemeDemoClient />
    </Suspense>
  );
} 