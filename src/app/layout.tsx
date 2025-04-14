import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Городские Кварталы - Краснодарская недвижимость',
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
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-red-600">
              <div className="flex items-center">
                <span className="text-red-600">ГОРОДСКИЕ КВАРТАЛЫ</span>
              </div>
              <div className="text-sm text-blue-500">краснодарская недвижимость</div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Главная</Link>
              <Link href="/listing-category/apartments" className="text-gray-600 hover:text-gray-900">Квартиры</Link>
              <Link href="/listing-category/houses" className="text-gray-600 hover:text-gray-900">Дома</Link>
              <Link href="/listing-category/land" className="text-gray-600 hover:text-gray-900">Земельные участки</Link>
              <Link href="/listing-category/commercial" className="text-gray-600 hover:text-gray-900">Коммерция</Link>
              <Link href="/listing-category/industrial" className="text-gray-600 hover:text-gray-900">Промышленные объекты</Link>
            </nav>
          </div>
          <div className="w-full max-w-md mx-auto mt-4">
            <SearchForm/>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer className="bg-white py-6 mt-12 border-t">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">©Все права защищены 2025г.</p>
            <p className="text-sm text-gray-500">Политика конфиденциальности</p>
          </div>
        </footer>
      </body>
    </html>
  );
}