import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import ListingDetail from './ListingDetail';
import { JWT_SECRET } from '@/lib/env';

// Remove the hardcoded fallback
// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Force dynamic rendering so cookies() can be used
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id: id },
      select: { title: true }
    });
    
    return {
      title: listing ? `${listing.title} | Realty Website` : 'Объявление не найдено',
      description: listing ? `Подробная информация о недвижимости: ${listing.title}` : 'Информация о объекте недвижимости'
    };
  } catch (error) {
    return {
      title: 'Просмотр объявления | Realty Website',
      description: 'Информация о объекте недвижимости'
    };
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    // Check if user is admin (to show admin comments)
    const isAdmin = await checkIfUserIsAdmin();
    
    const listing = await prisma.listing.findUnique({
      where: { id: id },
      include: {
        category: true,
        images: true,
      },
    });
    
    if (!listing) {
      redirect('/404');
    }
    
    // If user is not admin, strip out adminComment
    if (!isAdmin) {
      const { adminComment, ...publicData } = listing;
      return <ListingDetail listing={publicData} isAdmin={isAdmin} />;
    }
    
    // Admin sees everything
    return <ListingDetail listing={listing} isAdmin={isAdmin} />;
  } catch (error) {
    console.error('Error fetching listing:', error);
    redirect('/404');
  }
}

async function checkIfUserIsAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return false;
    
    const { id } = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ 
      where: { id }
    });
    
    return !!user;
  } catch {
    return false;
  }
}