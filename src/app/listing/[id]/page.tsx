import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import ListingDetail from './ListingDetail';
import { JWT_SECRET } from '@/lib/env';
import Script from 'next/script';
import StructuredDataBreadcrumb from '@/components/StructuredDataBreadcrumb';
import { Metadata } from 'next/types';
import { buildListingMetadata, ListingWithRelations } from '@/lib/seo/buildListingMetadata';

// Remove the hardcoded fallback
// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Force dynamic rendering so cookies() can be used
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        districtRef: true,
        propertyType: { select: { name: true } },
        city: { select: { name: true } },
      },
    });
    if (!listing) return { title: 'Объявление не найдено' };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oporadom.ru';
    const { metadata } = buildListingMetadata(listing as ListingWithRelations, baseUrl);
    return metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Просмотр объявления | ОпораДом', description: 'Ошибка' };
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
      where: { id },
      include: {
        category: true,
        images: true,
        districtRef: true,
        propertyType: {
          select: { name: true }
        },
        city: {
          select: { name: true }
        }
      },
    });
    
    if (!listing) {
      redirect('/404');
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oporadom.ru';
    const { jsonLd: structuredData } = buildListingMetadata(listing as ListingWithRelations, baseUrl);

    // Create breadcrumb data
    const breadcrumbItems = [
      { name: 'Главная', url: `${baseUrl}/` },
      { name: listing.category?.name || 'Недвижимость', url: `${baseUrl}/listing-category/${listing.category?.slug || ''}` },
      { name: listing.title, url: `${baseUrl}/listing/${listing.id}` },
    ];

    // If user is not admin, strip out adminComment
    if (!isAdmin) {
      // Use spread to create a new object without adminComment
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { adminComment, ...publicData } = listing;
      return (
        <>
          <StructuredDataBreadcrumb items={breadcrumbItems} />
          <Script
            id="listing-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData)
            }}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ListingDetail listing={publicData as any} isAdmin={isAdmin} />
        </>
      );
    }
    
    // Admin sees everything
    return (
      <>
        <StructuredDataBreadcrumb items={breadcrumbItems} />
        <Script
          id="listing-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ListingDetail listing={listing as any} isAdmin={isAdmin} />
      </>
    );
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