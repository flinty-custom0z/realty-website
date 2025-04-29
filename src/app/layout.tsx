import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { DealTypeProvider } from '@/contexts/DealTypeContext';
import ResponsiveNav from '@/components/ResponsiveNav';
import AdminNavClient from '@/components/AdminNavClient';
import SearchFormWrapper from '@/components/SearchFormWrapper';
import DealTypeThemeWrapper from '@/components/DealTypeThemeWrapper';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Вторичный Выбор - Краснодарская недвижимость',
  description: 'Сайт недвижимости в Краснодаре',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning={true} className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <DealTypeProvider>
          <DealTypeThemeWrapper>
            <header className="bg-white transition-all duration-300" id="site-header">
              <Suspense fallback={<div className="h-12 w-full bg-gray-100 animate-pulse rounded mb-4"></div>}>
                <ResponsiveNav />
              </Suspense>
              <div className="w-full max-w-xl mx-auto mt-6 pb-6 px-4">
                <Suspense fallback={<div className="h-10 w-full bg-gray-100 animate-pulse rounded"></div>}>
                  <SearchFormWrapper />
                </Suspense>
              </div>
            </header>
            <main className="bg-white min-h-screen pt-4 pb-12">
              {children}
            </main>
            <footer className="bg-white py-8 border-t border-gray-100">
              <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-500">©Все права защищены 2025г.</p>
                  <Suspense fallback={<div className="h-6 w-40 bg-gray-100 animate-pulse rounded"></div>}>
                    <AdminNavClient />
                  </Suspense>
                  <p className="text-sm text-gray-500">Политика конфиденциальности</p>
                </div>
              </div>
            </footer>
          </DealTypeThemeWrapper>
        </DealTypeProvider>
        <script dangerouslySetInnerHTML={{ __html: `
          // Wait for DOM content to fully load to avoid hydration mismatches
          document.addEventListener('DOMContentLoaded', () => {
            const header = document.getElementById('site-header');
            if (header) {
              // Apply initial state based on current scroll position
              if (window.scrollY > 100) {
                header.classList.add('sticky');
              }
              
              // Set up scroll event listener
              window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                  header.classList.add('sticky');
                } else {
                  header.classList.remove('sticky');
                }
              });
            }
          });
        `}} />
      </body>
    </html>
  );
}