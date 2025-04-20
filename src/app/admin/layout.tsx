// Force dynamic rendering so cookies() can be used at runtime.
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import AdminSidebar from '@/components/AdminSidebar';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromCookie() {
  try {
    // Await cookies() to resolve the promise
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      console.log('No token in cookie, returning null');
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, username: true },
    });
    if (!user) {
      console.log('User not found for token');
      return null;
    }
    console.log(`User found in layout: ${user.name}`);
    return user;
  } catch (error) {
    console.error('Error getting user from cookie:', error);
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();
  
  // If no user is found, redirect to the new login path
  if (!user) {
    console.log('No user found in layout, redirecting to admin-login');
    redirect('/admin-login');
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={user} />

      <main className="flex-1 p-6 bg-white">
        {children}
      </main>
    </div>
  );
}