'use client';

import { useDealType } from '@/contexts/DealTypeContext';
import Link from 'next/link';
import { useId } from 'react';

export default function Logo() {
  const { dealType } = useDealType();
  const maskId = useId();
  
  return (
    <Link href="/" className="text-2xl font-medium text-gray-800 flex flex-col">
      <div className="flex items-center">
        <div className="mr-2">
          <svg
            width={40}
            height={40}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Опора Дом логотип"
            role="img"
          >
            <mask id={`logo-mask-${maskId}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
              <rect width="100" height="100" rx="15" fill="white" />
              <rect x="20" y="20" width="60" height="7" rx="3.5" fill="black" />
              <rect x="27.5" y="33" width="45" height="4" rx="2" fill="black" />
              <rect x="30" y="44" width="8" height="39" fill="black" />
              <rect x="46" y="44" width="8" height="39" fill="black" />
              <rect x="62" y="44" width="8" height="39" fill="black" />
            </mask>
            <rect 
              width="100" 
              height="100" 
              rx="15" 
              fill="var(--deal-accent-color)" 
              mask={`url(#logo-mask-${maskId})`} 
            />
          </svg>
        </div>
        <div>
          <span className="text-gray-800">Опора</span>
          <span className="deal-accent-text">Дом</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 tracking-wide">краснодарская недвижимость</span>
    </Link>
  );
}