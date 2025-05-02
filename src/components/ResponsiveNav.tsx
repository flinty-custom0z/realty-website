'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useDealType } from '@/contexts/DealTypeContext';
import DealTypeToggle from '@/components/DealTypeToggle';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

export default function ResponsiveNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname() || '';
  const { dealType, setDealType } = useDealType();
  const { isAuthenticated, isLoading } = useAuth();
  
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
    return dealType === 'rent' 
      ? `/listing-category/${categorySlug}?deal=rent` 
      : `/listing-category/${categorySlug}`;
  };
  
  // For rent, only show apartments and commercial
  const shouldShowForRent = (categorySlug: string) => {
    return dealType !== 'rent' || ['apartments', 'commercial'].includes(categorySlug);
  };
  
  return (
    <div className="w-full">
      {/* Desktop sticky header - hidden on mobile */}
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-6">
          <Logo />
          
          <div className="flex items-center space-x-4">
            {/* Deal type toggle in navbar - only visible on desktop */}
            <div className="hidden md:flex mr-8">
              <DealTypeToggle 
                current={dealType} 
                variant="nav" 
                onChange={setDealType}
              />
            </div>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-8 mr-6">
              <Link 
                href="/"
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
              {isAuthenticated && !isLoading && (
                <Link 
                  href="/admin"
                  className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                    pathname.startsWith('/admin') ? 'text-gray-900' : ''
                  }`}
                >
                  Админ панель
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden bg-white shadow-lg transition-all duration-300 ease-in-out fixed inset-0 z-50 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        } overflow-hidden`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-600 focus:outline-none"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="relative h-[calc(100%-80px)] overflow-hidden">
          {/* Main Mobile Menu */}
          <nav className="mobile-menu-nav flex flex-col py-4 px-6 space-y-4 absolute inset-0">
            {/* Mobile deal type toggle */}
            <div className="py-2">
              <DealTypeToggle 
                current={dealType} 
                variant="default" 
                onChange={setDealType}
              />
            </div>
            
            {/* Mobile nav links */}
            <Link 
              href="/"
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
            
            {/* Admin panel link - only visible when authenticated */}
            {isAuthenticated && !isLoading && (
              <Link
                href="/admin"
                className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                  pathname.startsWith('/admin') ? 'text-gray-900 font-medium' : ''
                }`}
              >
                Админ панель
              </Link>
            )}
          </nav>
        </div>
      </div>
      
      {/* Mobile floating menu button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          id="menu-button"
          onClick={() => setIsMenuOpen(true)}
          className="mobile-menu-button rounded-full w-14 h-14 flex items-center justify-center shadow-md bg-white focus:outline-none hover:opacity-90 transition-opacity"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 deal-accent-text" />
        </button>
      </div>
    </div>
  );
}