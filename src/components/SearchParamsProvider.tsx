'use client';

import { ReactNode, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SearchParamsReader({ 
  children 
}: { 
  children: (searchParams: URLSearchParams | null) => ReactNode 
}) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}

export default function SearchParamsProvider({ 
  children 
}: { 
  children: (searchParams: URLSearchParams | null) => ReactNode 
}) {
  return (
    <Suspense fallback={<>{children(null)}</>}>
      <SearchParamsReader>{children}</SearchParamsReader>
    </Suspense>
  );
}