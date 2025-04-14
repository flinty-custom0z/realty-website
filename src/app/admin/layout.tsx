import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, username: true },
    });
    
    return user;
  } catch (error) {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromCookie();
  
  // Redirect to login if not authenticated
  if (!user && !window.location.pathname.includes('/admin/login')) {
    redirect('/admin/login');
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {user && (
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
              <li className="border-t pt-2 mt-4">
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="w-full text-left p-2 hover:bg-gray-100 rounded text-red-600">
                    Выйти
                  </button>
                </form>
              </li>
            </ul>
          </nav>
        </aside>
      )}
      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}