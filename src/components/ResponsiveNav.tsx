'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ResponsiveNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
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
  
  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-red-600">
            <div className="flex items-center">
              <span className="text-red-600">ВТОРИЧНЫЙ ВЫБОР</span>
            </div>
            <div className="text-sm text-blue-500">краснодарская недвижимость</div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 mr-4">
              <Link href="/" className={`text-gray-600 hover:text-gray-900 ${pathname === '/' ? 'font-semibold' : ''}`}>
                Главная
              </Link>
              <Link 
                href="/listing-category/apartments" 
                className={`text-gray-600 hover:text-gray-900 ${pathname === '/listing-category/apartments' ? 'font-semibold' : ''}`}
              >
                Квартиры
              </Link>
              <Link 
                href="/listing-category/houses" 
                className={`text-gray-600 hover:text-gray-900 ${pathname === '/listing-category/houses' ? 'font-semibold' : ''}`}
              >
                Дома
              </Link>
              <Link 
                href="/listing-category/land" 
                className={`text-gray-600 hover:text-gray-900 ${pathname === '/listing-category/land' ? 'font-semibold' : ''}`}
              >
                Земельные участки
              </Link>
              <Link 
                href="/listing-category/commercial" 
                className={`text-gray-600 hover:text-gray-900 ${pathname === '/listing-category/commercial' ? 'font-semibold' : ''}`}
              >
                Коммерция
              </Link>
              <Link 
                href="/listing-category/industrial" 
                className={`text-gray-600 hover:text-gray-900 ${pathname === '/listing-category/industrial' ? 'font-semibold' : ''}`}
              >
                Промышленные объекты
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <button
              id="menu-button"
              className="md:hidden ml-2 p-2 text-gray-600 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Открыть меню</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
        <nav className="flex flex-col py-2 px-4 space-y-2">
          <Link 
            href="/" 
            className={`py-2 px-4 text-gray-600 hover:bg-gray-100 rounded ${pathname === '/' ? 'font-semibold' : ''}`}
          >
            Главная
          </Link>
          <Link 
            href="/listing-category/apartments" 
            className={`py-2 px-4 text-gray-600 hover:bg-gray-100 rounded ${pathname === '/listing-category/apartments' ? 'font-semibold' : ''}`}
          >
            Квартиры
          </Link>
          <Link 
            href="/listing-category/houses" 
            className={`py-2 px-4 text-gray-600 hover:bg-gray-100 rounded ${pathname === '/listing-category/houses' ? 'font-semibold' : ''}`}
          >
            Дома
          </Link>
          <Link 
            href="/listing-category/land" 
            className={`py-2 px-4 text-gray-600 hover:bg-gray-100 rounded ${pathname === '/listing-category/land' ? 'font-semibold' : ''}`}
          >
            Земельные участки
          </Link>
          <Link 
            href="/listing-category/commercial" 
            className={`py-2 px-4 text-gray-600 hover:bg-gray-100 rounded ${pathname === '/listing-category/commercial' ? 'font-semibold' : ''}`}
          >
            Коммерция
          </Link>
          <Link 
            href="/listing-category/industrial" 
            className={`py-2 px-4 text-gray-600 hover:bg-gray-100 rounded ${pathname === '/listing-category/industrial' ? 'font-semibold' : ''}`}
          >
            Промышленные объекты
          </Link>
        </nav>
      </div>
    </div>
  );
}