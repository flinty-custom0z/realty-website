// Admin pages need dynamic rendering for authentication
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { JWT_SECRET } from '@/lib/env';
import { createLogger } from '@/lib/logging';

// Create a logger instance
const logger = createLogger('AdminLayout');

// Remove the hardcoded fallback
// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromCookie() {
  try {
    // Await cookies() to resolve the promise
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      logger.info('No token in cookie');
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, username: true },
    });
    if (!user) {
      logger.info('User not found for token');
      return null;
    }
    // Don't log user details
    logger.info('Valid user found');
    return user;
  } catch {
    // Avoid logging full error object
    logger.error('Error validating session');
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
    logger.info('Redirecting to login page');
    redirect('/admin-login');
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8 px-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}