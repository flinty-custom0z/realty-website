import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SearchForm from '@/components/SearchForm';
import ResponsiveNav from '@/components/ResponsiveNav';
import AdminNavClient from '@/components/AdminNavClient';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

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
    <html lang="ru">
      <body className={inter.className}>
        <header className="bg-white shadow-sm">
          <ResponsiveNav />
          <div className="w-full max-w-md mx-auto mt-4 pb-4">
            <SearchForm/>
          </div>
        </header>
  <main className="bg-white min-h-screen">
          {children}
        </main>
        <footer className="bg-white py-6 mt-12 border-t">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <p className="text-sm text-gray-500 mb-2 md:mb-0">©Все права защищены 2025г.</p>
              <AdminNavClient />
              <p className="text-sm text-gray-500 mt-2 md:mt-0">Политика конфиденциальности</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}