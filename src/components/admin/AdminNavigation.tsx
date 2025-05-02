import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { JWT_SECRET } from '@/lib/env';
import AdminSidebar from './AdminSidebar';
import AdminMobileNav from './AdminMobileNav';

async function getUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, username: true },
    });
    
    return user;
  } catch {
    return null;
  }
}

export default async function AdminNavigation() {
  const user = await getUserFromCookie();
  
  if (!user) {
    return null;
  }
  
  return (
    <>
      <AdminSidebar userName={user.name} />
      <AdminMobileNav userName={user.name} />
    </>
  );
} 