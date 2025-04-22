'use client';

import Link from 'next/link';
import Button from './Button';

export default function AdminSidebar({ user }: { user: { name: string } }) {
  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Админ панель</h2>
        <p className="text-sm text-gray-600">Привет, {user.name}</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/admin" className="block p-2 hover:bg-gray-100 rounded">
              Главная
            </Link>
          </li>
          <li>
            <Link href="/admin/listings" className="block p-2 hover:bg-gray-100 rounded">
              Объявления
            </Link>
          </li>
          <li>
            <Link href="/admin/listings/new" className="block p-2 hover:bg-gray-100 rounded">
              Добавить объявление
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="block p-2 hover:bg-gray-100 rounded">
              Риелторы
            </Link>
          </li>
          <li className="border-t pt-2 mt-4">
            <Button
              type="button"
              onClick={() => window.location.href = '/admin/logout'}
              variant="danger"
              fullWidth
            >
              Выйти
            </Button>
          </li>
        </ul>
      </nav>
    </aside>
  );
} 