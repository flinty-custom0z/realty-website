'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

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
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="text-2xl font-medium text-gray-800 flex flex-col">
            <span className="text-gray-800">ВТОРИЧНЫЙ ВЫБОР</span>
            <span className="text-xs text-gray-500 tracking-wide">краснодарская недвижимость</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 mr-6">
              <Link 
                href="/" 
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/' ? 'text-gray-900' : ''
                }`}
              >
                Главная
              </Link>
              <Link 
                href="/listing-category/apartments" 
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/listing-category/apartments' ? 'text-gray-900' : ''
                }`}
              >
                Квартиры
              </Link>
              <Link 
                href="/listing-category/houses" 
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/listing-category/houses' ? 'text-gray-900' : ''
                }`}
              >
                Дома
              </Link>
              <Link 
                href="/listing-category/land" 
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/listing-category/land' ? 'text-gray-900' : ''
                }`}
              >
                Земельные участки
              </Link>
              <Link 
                href="/listing-category/commercial" 
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/listing-category/commercial' ? 'text-gray-900' : ''
                }`}
              >
                Коммерция
              </Link>
              <Link 
                href="/listing-category/industrial" 
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/listing-category/industrial' ? 'text-gray-900' : ''
                }`}
              >
                Промышленные объекты
              </Link>
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
          <Link 
            href="/" 
            className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
              pathname === '/' ? 'text-gray-900 font-medium' : ''
            }`}
          >
            Главная
          </Link>
          <Link 
            href="/listing-category/apartments" 
            className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
              pathname === '/listing-category/apartments' ? 'text-gray-900 font-medium' : ''
            }`}
          >
            Квартиры
          </Link>
          <Link 
            href="/listing-category/houses" 
            className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
              pathname === '/listing-category/houses' ? 'text-gray-900 font-medium' : ''
            }`}
          >
            Дома
          </Link>
          <Link 
            href="/listing-category/land" 
            className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
              pathname === '/listing-category/land' ? 'text-gray-900 font-medium' : ''
            }`}
          >
            Земельные участки
          </Link>
          <Link 
            href="/listing-category/commercial" 
            className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
              pathname === '/listing-category/commercial' ? 'text-gray-900 font-medium' : ''
            }`}
          >
            Коммерция
          </Link>
          <Link 
            href="/listing-category/industrial" 
            className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
              pathname === '/listing-category/industrial' ? 'text-gray-900 font-medium' : ''
            }`}
          >
            Промышленные объекты
          </Link>
        </nav>
      </div>
    </div>
  );
}