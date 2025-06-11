'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { useDealType } from '@/contexts/DealTypeContext';
import Logo from '@/components/Logo';
import { formatPhoneNumber } from '@/lib/utils';

export default function ResponsiveNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const { dealType } = useDealType();
  
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
  
  // Function to get URL for deal type listings
  const getDealTypeUrl = (type: 'sale' | 'rent') => {
    return type === 'rent' ? '/?deal=rent' : '/';
  };
  
  // Helper to check if current deal type is active
  const isActiveDealType = (type: 'sale' | 'rent') => {
    return dealType === type;
  };
  
  return (
    <div className="w-full">
      {/* SOLUTION 1: Three-column layout with better spacing */}
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-5">
          {/* Left section: Logo */}
          <div className="flex items-center">
            <Logo />
          </div>
          
          {/* Center section: Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">            
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link 
                href="/"
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/' && !searchParams?.get('deal') ? 'text-gray-900' : ''
                }`}
              >
                Главная
              </Link>
              <Link 
                href={getDealTypeUrl('sale')}
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/' && isActiveDealType('sale') ? 'deal-accent-text' : ''
                }`}
              >
                Продажа
              </Link>
              <Link 
                href={getDealTypeUrl('rent')}
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/' && isActiveDealType('rent') ? 'deal-accent-text' : ''
                }`}
              >
                Аренда
              </Link>
              <Link 
                href="/map"
                className={`text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium ${
                  pathname === '/map' ? 'text-gray-900' : ''
                }`}
              >
                Карта
              </Link>
            </nav>
          </div>
          
          {/* Right section: Phone numbers */}
          <div className="hidden md:flex flex-col items-start space-y-1">
            <a
              href="tel:+79624441579"
              className="flex items-center text-[14px] font-medium deal-accent-text hover:opacity-80 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2 deal-accent-text" />
              {formatPhoneNumber('+79624441579')}
            </a>
            <a
              href="tel:+79298510395"
              className="flex items-center text-[14px] font-medium deal-accent-text hover:opacity-80 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2 deal-accent-text" />
              {formatPhoneNumber('+79298510395')}
            </a>
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
            {/* Phone numbers - mobile */}
            <div className="bg-blue-50 rounded-lg p-4 mb-2">
              <a href="tel:+79624441579" className="flex items-center justify-center py-2 text-[15px] font-semibold deal-accent-text hover:opacity-80 transition-colors">
                <Phone className="h-4 w-4 mr-2 deal-accent-text" />
                {formatPhoneNumber('+79624441579')}
              </a>
              <div className="h-px bg-blue-100 my-2"></div>
              <a href="tel:+79097725578" className="flex items-center justify-center py-2 text-[15px] font-medium deal-accent-text hover:opacity-80 transition-colors">
                <Phone className="h-4 w-4 mr-2 deal-accent-text" />
                {formatPhoneNumber('+79097725578')}
              </a>
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
            <Link 
              href={getDealTypeUrl('sale')}
              className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                pathname === '/' && isActiveDealType('sale') ? 'text-gray-900 font-medium' : ''
              }`}
            >
              Продажа
            </Link>
            <Link 
              href={getDealTypeUrl('rent')}
              className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                pathname === '/' && isActiveDealType('rent') ? 'text-gray-900 font-medium' : ''
              }`}
            >
              Аренда
            </Link>
            
            <Link 
              href="/map"
              className={`py-2 text-gray-600 hover:text-gray-900 transition-colors ${
                pathname === '/map' ? 'text-gray-900 font-medium' : ''
              }`}
            >
              Карта
            </Link>
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