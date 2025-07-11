// Server component
import React, { Suspense } from 'react';
import ThemeDemoClient from './theme-demo-client';

// Enable ISR with 5 minute revalidation
export const revalidate = 300;

export default function ThemeDemoPage() {
  return (
    <Suspense fallback={<div>Loading theme demo...</div>}>
      <ThemeDemoClient />
    </Suspense>
  );
} 