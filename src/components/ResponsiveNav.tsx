'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useDealType } from '@/contexts/DealTypeContext';
import DealTypeToggle from '@/components/DealTypeToggle';

export default function ResponsiveNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { dealType, setDealType } = useDealType();
  
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
  
  // Track scrolling for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
      {isScrolled && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-2 px-4 flex justify-center">
          <DealTypeToggle 
            current={dealType} 
            onChange={setDealType}
          />
        </div>
      )}
      
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="text-2xl font-medium text-gray-800 flex flex-col">
            <span className="text-gray-800">ВТОРИЧНЫЙ ВЫБОР</span>
            <span className="text-xs text-gray-500 tracking-wide">краснодарская недвижимость</span>
          </Link>
          
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
        </nav>
      </div>
    </div>
  );
}