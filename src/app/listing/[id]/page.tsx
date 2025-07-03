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
    const areaText = listing.houseArea ? `, ${listing.houseArea} м²` : '';
    const districtText = listing.districtRef?.name ? `, ${listing.districtRef.name}` : '';
    const cityText = listing.city?.name || 'Краснодар';
    
    const title = `${listing.title} — ${listing.price.toLocaleString('ru-RU')} ₽${areaText} | ОпораДом`;
    
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
    
    // Trim description to 160 characters for SEO
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    // Generate comprehensive keywords for Russian SEO
    const keywords = [];
    
    // Base keywords with deal type
    const propertyTypeName = listing.propertyType?.name || 'недвижимость';
    if (listing.dealType === 'RENT') {
      keywords.push(`снять ${propertyTypeName} ${cityText}`);
      keywords.push(`аренда ${propertyTypeName} ${cityText}`);
      keywords.push(`сдается ${propertyTypeName}`);
    } else {
      keywords.push(`купить ${propertyTypeName} ${cityText}`);
      keywords.push(`продажа ${propertyTypeName} ${cityText}`);
      keywords.push(`продается ${propertyTypeName}`);
    }
    
    // Location-specific keywords
    if (listing.districtRef?.name) {
      keywords.push(`недвижимость ${listing.districtRef.name}`);
      keywords.push(`${propertyTypeName} ${listing.districtRef.name}`);
      keywords.push(`${listing.districtRef.name} ${cityText}`);
    }
    
    // Category and property type
    if (listing.category?.name) {
      keywords.push(listing.category.name);
      keywords.push(`${listing.category.name} ${cityText}`);
    }
    if (listing.propertyType?.name) {
      keywords.push(listing.propertyType.name);
    }
    
    // Property characteristics
    if (listing.houseArea) {
      keywords.push(`${listing.houseArea} м²`);
      keywords.push(`площадь ${listing.houseArea} м²`);
    }
    
    if (listing.floor && listing.totalFloors) {
      keywords.push(`${listing.floor} этаж`);
      keywords.push(`${listing.floor}/${listing.totalFloors} этаж`);
    }
    
    if (listing.yearBuilt) {
      keywords.push(`год постройки ${listing.yearBuilt}`);
      keywords.push(`новостройка ${listing.yearBuilt}`);
    }
    
    if (listing.condition) {
      keywords.push(`состояние ${listing.condition}`);
      keywords.push(listing.condition);
    }
    
    // Price-related keywords
    const priceRange = listing.price;
    if (priceRange < 3000000) {
      keywords.push('недорого');
      keywords.push('бюджетная недвижимость');
    } else if (priceRange > 10000000) {
      keywords.push('элитная недвижимость');
      keywords.push('премиум');
    }
    
    // Land area for houses
    if (listing.landArea) {
      keywords.push(`участок ${listing.landArea} соток`);
      keywords.push(`${listing.landArea} соток`);
    }

    // Build Open Graph images
    const ogImages = listing.images?.slice(0, 4).map(img => ({
      url: `https://oporadom.ru/api/image/${img.path}`,
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
        url: `https://oporadom.ru/listing/${id}`,
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
      // Extended meta tags for better SEO
      other: {
        'yandex-verification': process.env.YANDEX_VERIFICATION || '',
        'format-detection': 'telephone=yes',
        'geo.region': 'RU-KDA',
        'geo.placename': cityText,
        ...(listing.latitude && listing.longitude && {
          'geo.position': `${listing.latitude};${listing.longitude}`
        }),
        // Price metadata
        'og:price:amount': listing.price.toString(),
        'og:price:currency': 'RUB',
        'product:price:amount': listing.price.toString(),
        'product:price:currency': 'RUB',
        // Property-specific metadata
        ...(listing.houseArea && {
          'property:area': listing.houseArea.toString(),
          'property:area:units': 'square_meters'
        }),
        ...(listing.floor && listing.totalFloors && {
          'property:floor': listing.floor.toString(),
          'property:floors:total': listing.totalFloors.toString()
        }),
        ...(listing.yearBuilt && {
          'property:year_built': listing.yearBuilt.toString()
        }),
        ...(listing.condition && {
          'property:condition': listing.condition
        }),
        ...(listing.landArea && {
          'property:land_area': listing.landArea.toString(),
          'property:land_area:units': 'sotka'
        }),
        // Location metadata
        ...(listing.districtRef?.name && {
          'property:district': listing.districtRef.name
        }),
        'property:city': cityText,
        'property:deal_type': listing.dealType.toLowerCase(),
        'property:type': listing.propertyType?.name || 'недвижимость',
        'property:category': listing.category?.name || '',
        // Contact info for rich snippets
        'business:contact_data:phone_number': '+79624441579',
        'business:contact_data:website': 'https://oporadom.ru'
      },
      // Canonical URL
      alternates: {
        canonical: `https://oporadom.ru/listing/${id}`
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
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": `${listing.address || listing.title} - ${listing.price.toLocaleString('ru-RU')} ₽`,
      "description": listing.publicDescription || listing.title,
      "url": `https://oporadom.ru/listing/${listing.id}`,
      "datePosted": listing.dateAdded.toISOString(),
      "mainEntity": {
        "@type": listing.category?.slug === 'apartments' || listing.category?.slug === 'apartment' ? "Apartment" : 
                listing.category?.slug === 'houses' || listing.category?.slug === 'house' ? "House" : "Residence",
        "name": listing.address || listing.title,
        "numberOfRooms": listing.floor && listing.totalFloors ? `${listing.floor}/${listing.totalFloors} этаж` : undefined,
        "floorSize": listing.houseArea ? {
          "@type": "QuantitativeValue",
          "value": listing.houseArea,
          "unitText": "м²"
        } : undefined,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": listing.address || listing.fullAddress,
          "addressLocality": listing.city?.name || "Краснодар",
          "addressRegion": "Краснодарский край",
          "addressCountry": "RU"
        }
      } as Record<string, unknown>,
      "listingAgent": {
        "@type": "RealEstateAgent",
        "name": "ОпораДом",
        "telephone": ["+79624441579", "+79298510395"],
        "email": "oporadom@gmail.com"
      },
      "offers": {
        "@type": "Offer",
        "price": listing.price,
        "priceCurrency": "RUB",
        "businessFunction": listing.dealType === 'RENT' ? "https://schema.org/LeaseOut" : "https://schema.org/Sell",
        "availability": "https://schema.org/InStock",
        "validFrom": listing.dateAdded.toISOString(),
        "seller": {
          "@type": "RealEstateAgent",
          "name": "ОпораДом",
          "telephone": ["+79624441579", "+79298510395"],
          "email": "info@oporadom.ru"
        }
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": listing.address || listing.fullAddress,
        "addressLocality": listing.city?.name || "Краснодар",
        "addressRegion": "Краснодарский край",
        "addressCountry": "RU"
      }
    } as Record<string, unknown>;

    // Add comprehensive property details to mainEntity
    const mainEntity = structuredData.mainEntity as Record<string, unknown>;
    
    // Physical characteristics
    if (listing.landArea) {
      mainEntity.lotSize = {
        "@type": "QuantitativeValue", 
        "value": listing.landArea,
        "unitText": "соток"
      };
    }

    if (listing.yearBuilt) {
      mainEntity.yearBuilt = listing.yearBuilt;
    }

    if (listing.floor) {
      mainEntity.floorLevel = listing.floor;
    }

    if (listing.totalFloors) {
      mainEntity.numberOfFloorsInBuilding = listing.totalFloors;
    }

    if (listing.condition) {
      mainEntity.propertyCondition = listing.condition;
    }

    // Kitchen area for apartments
    if (listing.kitchenArea) {
      mainEntity.kitchenArea = {
        "@type": "QuantitativeValue",
        "value": listing.kitchenArea,
        "unitText": "м²"
      };
    }

    // Additional amenities
    const amenities = [];
    if (listing.balconyType) amenities.push(`Балкон: ${listing.balconyType}`);
    if (listing.bathroomType) amenities.push(`Санузел: ${listing.bathroomType}`);
    if (listing.windowsView) amenities.push(`Вид из окон: ${listing.windowsView}`);
    if (listing.buildingType) amenities.push(`Тип дома: ${listing.buildingType}`);
    
    if (amenities.length > 0) {
      mainEntity.amenityFeature = amenities.map(amenity => ({
        "@type": "LocationFeatureSpecification",
        "name": amenity
      }));
    }

    // Legal status
    if (listing.noEncumbrances || listing.noShares) {
      const legalFeatures = [];
      if (listing.noEncumbrances) legalFeatures.push("Без обременений");
      if (listing.noShares) legalFeatures.push("Без долей");
      
      mainEntity.legalStatus = legalFeatures.join(", ");
    }

    // Add images
    if (listing.images && listing.images.length > 0) {
      const imageUrls = listing.images.map(img => 
        `https://oporadom.ru/api/image/${img.path}`
      );
      structuredData.image = imageUrls;
      mainEntity.image = imageUrls;
    }

    // Add geo coordinates if available
    if (listing.latitude && listing.longitude) {
      const geoData = {
        "@type": "GeoCoordinates",
        "latitude": listing.latitude,
        "longitude": listing.longitude
      };
      structuredData.geo = geoData;
      mainEntity.geo = geoData;
    }

    // Add property type and category
    if (listing.propertyType?.name) {
      structuredData.additionalType = listing.propertyType.name;
      mainEntity.additionalType = listing.propertyType.name;
    }

    if (listing.category?.name) {
      structuredData.category = listing.category.name;
    }

    // Create breadcrumb data
    const breadcrumbItems = [
      { name: "Главная", url: "https://oporadom.ru/" },
      { name: listing.category?.name || "Недвижимость", url: `https://oporadom.ru/listing-category/${listing.category?.slug || ''}` },
      { name: listing.title, url: `https://oporadom.ru/listing/${listing.id}` }
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