import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ListingDetail from './ListingDetail';
import Script from 'next/script';
import StructuredDataBreadcrumb from '@/components/StructuredDataBreadcrumb';
import { Metadata } from 'next/types';
import { buildListingMetadata, ListingWithRelations } from '@/lib/seo/buildListingMetadata';
import StaticCache from '@/lib/cache/staticCache';

// Enable ISR with 10 minute revalidation
export const revalidate = 600;

// Pre-generate the 100 most recent listings at build time
export async function generateStaticParams() {
  const listings = await prisma.listing.findMany({
    where: { status: 'active' },
    select: { id: true },
    orderBy: { dateAdded: 'desc' },
    take: 100, // Pre-build top 100 listings
  });
  
  return listings.map(listing => ({
    id: listing.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const listing = await StaticCache.getListingById(id);
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
    
    const listing = await StaticCache.getListingById(id);
    
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

    // Always pass the full listing data - the client component will handle admin checks
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
        <ListingDetail listing={listing as any} isAdmin={false} />
      </>
    );
  } catch (error) {
    console.error('Error fetching listing:', error);
    redirect('/404');
  }
}

