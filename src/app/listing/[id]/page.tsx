import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import ListingDetail from './ListingDetail';
import { JWT_SECRET } from '@/lib/env';
import Script from 'next/script';
import StructuredDataBreadcrumb from '@/components/StructuredDataBreadcrumb';
import { Metadata } from 'next/types';

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
      }
    });
    
    if (!listing) {
      return {
        title: 'Объявление не найдено | ОпораДом',
        description: 'Информация о объекте недвижимости не найдена'
      };
    }

    // Build dynamic Russian title
    const dealTypeText = listing.dealType === 'RENT' ? 'аренда' : 'продажа';
    const areaText = listing.houseArea ? `, ${listing.houseArea} м²` : '';
    const districtText = listing.districtRef?.name ? `, ${listing.districtRef.name}` : '';
    const cityText = listing.city?.name || 'Краснодар';
    
    const title = `${listing.title} — ${dealTypeText} ${listing.price.toLocaleString('ru-RU')} ₽${areaText} | ОпораДом`;
    
    // Build comprehensive description with property details
    let description = '';
    if (listing.dealType === 'RENT') {
      description = `Сдается ${listing.propertyType?.name || 'недвижимость'} в ${cityText}${districtText}`;
    } else {
      description = `Продается ${listing.propertyType?.name || 'недвижимость'} в ${cityText}${districtText}`;
    }
    
    if (listing.houseArea) {
      description += `. Площадь ${listing.houseArea} м²`;
    }
    
    if (listing.floor && listing.totalFloors) {
      description += `. ${listing.floor}/${listing.totalFloors} этаж`;
    }
    
    if (listing.yearBuilt) {
      description += `. Год постройки ${listing.yearBuilt}`;
    }
    
    if (listing.publicDescription) {
      const shortDesc = listing.publicDescription.substring(0, 100);
      description += `. ${shortDesc}${listing.publicDescription.length > 100 ? '...' : ''}`;
    }
    
    description += '. Звоните: +7(962)444-15-79';

    // Generate keywords for Russian SEO
    const keywords = [];
    
    // Base keywords
    if (listing.dealType === 'RENT') {
      keywords.push(`снять ${listing.propertyType?.name || 'недвижимость'} ${cityText}`);
      keywords.push(`аренда ${listing.propertyType?.name || 'недвижимость'} ${cityText}`);
    } else {
      keywords.push(`купить ${listing.propertyType?.name || 'недвижимость'} ${cityText}`);
      keywords.push(`продажа ${listing.propertyType?.name || 'недвижимость'} ${cityText}`);
    }
    
    // District-specific keywords
    if (listing.districtRef?.name) {
      keywords.push(`недвижимость ${listing.districtRef.name}`);
      keywords.push(`${listing.propertyType?.name || 'недвижимость'} ${listing.districtRef.name}`);
    }
    
    // Category-specific keywords
    if (listing.category?.name) {
      keywords.push(listing.category.name);
    }
    
    // Area-specific keywords
    if (listing.houseArea) {
      keywords.push(`${listing.houseArea} м²`);
    }
    
    // Property type
    if (listing.propertyType?.name) {
      keywords.push(listing.propertyType.name);
    }

    // Build Open Graph images
    const ogImages = listing.images?.slice(0, 4).map(img => ({
      url: `https://opora-dom.ru/api/image/${img.path}`,
      width: 1200,
      height: 630,
      alt: `${listing.title} - ${listing.address || listing.fullAddress || cityText}`
    })) || [];

    return {
      title,
      description,
      keywords: keywords.join(', '),
      openGraph: {
        title,
        description,
        url: `https://opora-dom.ru/listing/${id}`,
        locale: 'ru_RU',
        type: 'article',
        siteName: 'ОпораДом',
        images: ogImages,
        // Additional OG tags for real estate
        ...(listing.price && {
          'article:tag': `цена ${listing.price.toLocaleString('ru-RU')} ₽`
        } as Record<string, string>)
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: description.length > 200 ? description.substring(0, 200) + '...' : description,
        images: ogImages.length > 0 ? [ogImages[0].url] : undefined
      },
      // Yandex-specific meta tags
      other: {
        'yandex-verification': process.env.YANDEX_VERIFICATION || '',
        'format-detection': 'telephone=yes',
        'geo.region': 'RU-KDA',
        'geo.placename': cityText,
        ...(listing.latitude && listing.longitude && {
          'geo.position': `${listing.latitude};${listing.longitude}`
        }),
        'og:price:amount': listing.price.toString(),
        'og:price:currency': 'RUB',
        'product:price:amount': listing.price.toString(),
        'product:price:currency': 'RUB'
      },
      // Canonical URL
      alternates: {
        canonical: `https://opora-dom.ru/listing/${id}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Просмотр объявления | ОпораДом',
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
    const structuredData: Record<string, unknown> = {
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
      structuredData.floorSize = {
        "@type": "QuantitativeValue",
        "value": listing.houseArea,
        "unitCode": "MTK" // Square meter
      };
    }

    if (listing.landArea) {
      structuredData.lotSize = {
        "@type": "QuantitativeValue", 
        "value": listing.landArea,
        "unitText": "соток"
      };
    }

    if (listing.yearBuilt) {
      structuredData.yearBuilt = listing.yearBuilt;
    }

    if (listing.floor && listing.totalFloors) {
      structuredData.numberOfRooms = `${listing.floor}/${listing.totalFloors} этаж`;
    }

    // Add images
    if (listing.images && listing.images.length > 0) {
      structuredData.image = listing.images.map(img => 
        `https://opora-dom.ru/api/image/${img.path}`
      );
    }

    // Add geo coordinates if available
    if (listing.latitude && listing.longitude) {
      structuredData.geo = {
        "@type": "GeoCoordinates",
        "latitude": listing.latitude,
        "longitude": listing.longitude
      };
    }

    // Add property type and category
    if (listing.propertyType?.name) {
      structuredData.additionalType = listing.propertyType.name;
    }

    if (listing.category?.name) {
      structuredData.category = listing.category.name;
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