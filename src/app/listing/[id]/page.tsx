import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import ListingDetail from './ListingDetail';
import { JWT_SECRET } from '@/lib/env';
import Script from 'next/script';
import StructuredDataBreadcrumb from '@/components/StructuredDataBreadcrumb';

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
  } catch (_error) {
    // Error handling, specifics not needed
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
    
    // Create structured data for the listing
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": listing.title,
      "description": listing.publicDescription || listing.title,
      "url": `https://opora-dom.ru/listing/${listing.id}`,
      "datePosted": listing.dateAdded.toISOString(),
      "listingAgent": {
        "@type": "Organization",
        "name": "ОпораДом",
        "telephone": ["+79624441579", "+79298510395"]
      },
      "offers": {
        "@type": "Offer",
        "price": listing.price,
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "validFrom": listing.dateAdded.toISOString()
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": listing.address || listing.fullAddress,
        "addressLocality": listing.city?.name || "Краснодар",
        "addressRegion": "Краснодарский край",
        "addressCountry": "RU"
      }
    };

    // Add property-specific details
    if (listing.houseArea) {
      (structuredData as any).floorSize = {
        "@type": "QuantitativeValue",
        "value": listing.houseArea,
        "unitCode": "MTK" // Square meter
      };
    }

    if (listing.landArea) {
      (structuredData as any).lotSize = {
        "@type": "QuantitativeValue", 
        "value": listing.landArea,
        "unitText": "соток"
      };
    }

    if (listing.yearBuilt) {
      (structuredData as any).yearBuilt = listing.yearBuilt;
    }

    if (listing.floor && listing.totalFloors) {
      (structuredData as any).numberOfRooms = `${listing.floor}/${listing.totalFloors} этаж`;
    }

    // Add images
    if (listing.images && listing.images.length > 0) {
      (structuredData as any).image = listing.images.map(img => 
        `https://opora-dom.ru/api/image/${img.path}`
      );
    }

    // Add geo coordinates if available
    if (listing.latitude && listing.longitude) {
      (structuredData as any).geo = {
        "@type": "GeoCoordinates",
        "latitude": listing.latitude,
        "longitude": listing.longitude
      };
    }

    // Add property type and category
    if (listing.propertyType?.name) {
      (structuredData as any).additionalType = listing.propertyType.name;
    }

    if (listing.category?.name) {
      (structuredData as any).category = listing.category.name;
    }

    // Create breadcrumb data
    const breadcrumbItems = [
      { name: "Главная", url: "https://opora-dom.ru/" },
      { name: listing.category?.name || "Недвижимость", url: `https://opora-dom.ru/listing-category/${listing.category?.slug || ''}` },
      { name: listing.title, url: `https://opora-dom.ru/listing/${listing.id}` }
    ];

    // If user is not admin, strip out adminComment
    if (!isAdmin) {
      // Use spread to create a new object without adminComment
      const { adminComment: _, ...publicData } = listing;
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