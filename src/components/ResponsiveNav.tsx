'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function ResponsiveNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get current deal type from URL, default to SALE
  const currentDealType = searchParams.get('dealType') || 'SALE';
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('#mobile-menu') && !target.closest('#menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Function to create category URL with current deal type
  const getCategoryUrl = (categorySlug: string) => {
    return `/listing-category/${categorySlug}?dealType=${currentDealType}`;
  };
  
  // For rent, only show apartments and commercial
  const shouldShowForRent = (categorySlug: string) => {
    return currentDealType !== 'RENT' || ['apartments', 'commercial'].includes(categorySlug);
  };
  
  return (
    <div className="w-full">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-6">
          <Link href={`/?dealType=${currentDealType}`} className="text-2xl font-medium text-gray-800 flex flex-col">
            <span className="text-gray-800">ВТОРИЧНЫЙ ВЫБОР</span>
            <span className="text-xs text-gray-500 tracking-wide">краснодарская недвижимость</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Deal type toggle */}
            <div className="hidden md:flex space-x-4 mr-8">
              <Link 
                href={`/?dealType=SALE`}
                className={`text-sm font-medium ${currentDealType === 'SALE' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Продажа
              </Link>
              <Link 
                href={`/?dealType=RENT`}
                className={`text-sm font-medium ${currentDealType === 'RENT' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Аренда
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 mr-6">
              <Link 
                href={`/?dealType=${currentDealType}`}
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/' ? 'text-gray-900' : ''
                }`}
              >
                Главная
              </Link>
              {shouldShowForRent('apartments') && (
                <Link 
                  href={getCategoryUrl('apartments')}
                  className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                    pathname === '/listing-category/apartments' ? 'text-gray-900' : ''
                  }`}
                >
                  Квартиры
                </Link>
              )}
              {shouldShowForRent('houses') && (
                <Link 
                  href={getCategoryUrl('houses')}
                  className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                    pathname === '/listing-category/houses' ? 'text-gray-900' : ''
                  }`}
                >
                  Дома
                </Link>
              )}
              {shouldShowForRent('land') && (
                <Link 
                  href={getCategoryUrl('land')}
                  className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                    pathname === '/listing-category/land' ? 'text-gray-900' : ''
                  }`}
                >
                  Земельные участки
                </Link>
              )}
              {shouldShowForRent('commercial') && (
                <Link 
                  href={getCategoryUrl('commercial')}
                  className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                    pathname === '/listing-category/commercial' ? 'text-gray-900' : ''
                  }`}
                >
                  Коммерция
                </Link>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <button
              id="menu-button"
              className="md:hidden p-2 text-gray-600 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Открыть меню</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 invisible'
        } overflow-hidden`}
      >
        <nav className="flex flex-col py-4 px-6 space-y-4">
          {/* Mobile deal type toggle */}
          <div className="flex space-x-4 py-2">
            <Link 
              href={`/?dealType=SALE`}
              className={`text-sm font-medium ${currentDealType === 'SALE' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Продажа
            </Link>
            <Link 
              href={`/?dealType=RENT`}
              className={`text-sm font-medium ${currentDealType === 'RENT' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Аренда
            </Link>
          </div>
          
          <Link 
            href={`/?dealType=${currentDealType}`}
            className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
              pathname === '/' ? 'text-gray-900 font-medium' : ''
            }`}
          >
            Главная
          </Link>
          {shouldShowForRent('apartments') && (
            <Link 
              href={getCategoryUrl('apartments')}
              className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                pathname === '/listing-category/apartments' ? 'text-gray-900 font-medium' : ''
              }`}
            >
              Квартиры
            </Link>
          )}
          {shouldShowForRent('houses') && (
            <Link 
              href={getCategoryUrl('houses')}
              className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                pathname === '/listing-category/houses' ? 'text-gray-900 font-medium' : ''
              }`}
            >
              Дома
            </Link>
          )}
          {shouldShowForRent('land') && (
            <Link 
              href={getCategoryUrl('land')}
              className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                pathname === '/listing-category/land' ? 'text-gray-900 font-medium' : ''
              }`}
            >
              Земельные участки
            </Link>
          )}
          {shouldShowForRent('commercial') && (
            <Link 
              href={getCategoryUrl('commercial')}
              className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                pathname === '/listing-category/commercial' ? 'text-gray-900 font-medium' : ''
              }`}
            >
              Коммерция
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}