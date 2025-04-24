'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Simplify to use lowercase deal types
type DealType = 'sale' | 'rent';

interface DealTypeToggleProps {
  current: DealType;
}

export default function DealTypeToggle({ current }: DealTypeToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleToggle = (dealType: DealType) => {
    const params = new URLSearchParams(searchParams);
    
    if (dealType === 'sale') {
      // For sale, we remove the param since it's the default
      params.delete('deal');
    } else {
      // For rent, we set deal=rent
      params.set('deal', 'rent');
    }
    
    // Push the new URL with updated params
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex mb-6" role="group" aria-label="Вид сделки">
      <button
        onClick={() => handleToggle('sale')}
        className={`px-6 py-2 text-sm font-medium rounded-l-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
          current === 'sale' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-pressed={current === 'sale'}
      >
        Продажа
      </button>
      <button
        onClick={() => handleToggle('rent')}
        className={`px-6 py-2 text-sm font-medium rounded-r-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
          current === 'rent' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-pressed={current === 'rent'}
      >
        Аренда
      </button>
    </div>
  );
} 