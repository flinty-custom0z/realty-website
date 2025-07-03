import type { Metadata } from 'next';
import { Listing } from '@prisma/client';

/**
 * Subset of listing fields we require for SEO.
 * Extend this if you add more columns in the future.
 */
export interface ListingWithRelations extends Pick<Listing,
  | 'id'
  | 'title'
  | 'price'
  | 'houseArea'
  | 'landArea'
  | 'floor'
  | 'totalFloors'
  | 'yearBuilt'
  | 'condition'
  | 'dealType'
  | 'dateAdded'
  | 'publicDescription'
  | 'latitude'
  | 'longitude'
  | 'address'
  | 'fullAddress'> {
  // Relations (partial shapes)
  images: { path: string; isFeatured: boolean }[];
  category?: { name: string; slug: string } | null;
  propertyType?: { name: string } | null;
  districtRef?: { name: string } | null;
  city?: { name: string } | null;
  // Optional extra fields used for keywords / features
  kitchenArea?: number | null;
  balconyType?: string | null;
  bathroomType?: string | null;
  windowsView?: string | null;
  buildingType?: string | null;
  noEncumbrances?: boolean | null;
  noShares?: boolean | null;
}

export interface ListingSEOResult {
  metadata: Metadata;
  jsonLd: Record<string, unknown>;
  keywordsArray: string[];
}

export function buildListingMetadata(listing: ListingWithRelations, baseUrl: string): ListingSEOResult {
  // Fallback values
  const cityText = listing.city?.name || 'Краснодар';
  const areaText = listing.houseArea ? `, ${listing.houseArea} м²` : '';
  const districtText = listing.districtRef?.name ? `, ${listing.districtRef.name}` : '';

  // -------- TITLE --------
  const title = `${listing.title} — ${listing.price.toLocaleString('ru-RU')} ₽${areaText} | ОпораДом`;

  // -------- DESCRIPTION --------
  let description = listing.dealType === 'RENT'
    ? `Сдается ${listing.propertyType?.name || 'недвижимость'} в ${cityText}${districtText}`
    : `Продается ${listing.propertyType?.name || 'недвижимость'} в ${cityText}${districtText}`;

  if (listing.houseArea) description += `. Площадь ${listing.houseArea} м²`;
  if (listing.floor && listing.totalFloors) description += `. ${listing.floor}/${listing.totalFloors} этаж`;
  if (listing.yearBuilt) description += `. Год постройки ${listing.yearBuilt}`;
  if (listing.publicDescription) {
    const shortDesc = listing.publicDescription.substring(0, 100);
    description += `. ${shortDesc}${listing.publicDescription.length > 100 ? '…' : ''}`;
  }
  description += '. Звоните: +7(962)444-15-79';
  if (description.length > 160) description = description.slice(0, 157) + '…';

  // -------- KEYWORDS --------
  const keywords: string[] = [];
  const propertyTypeName = listing.propertyType?.name || 'недвижимость';
  if (listing.dealType === 'RENT') {
    keywords.push(`снять ${propertyTypeName} ${cityText}`, `аренда ${propertyTypeName} ${cityText}`, `сдается ${propertyTypeName}`);
  } else {
    keywords.push(`купить ${propertyTypeName} ${cityText}`, `продажа ${propertyTypeName} ${cityText}`, `продается ${propertyTypeName}`);
  }
  if (listing.districtRef?.name) {
    keywords.push(
      `недвижимость ${listing.districtRef.name}`,
      `${propertyTypeName} ${listing.districtRef.name}`,
      `${listing.districtRef.name} ${cityText}`
    );
  }
  if (listing.category?.name) keywords.push(listing.category.name, `${listing.category.name} ${cityText}`);
  if (listing.propertyType?.name) keywords.push(listing.propertyType.name);
  if (listing.houseArea) keywords.push(`${listing.houseArea} м²`, `площадь ${listing.houseArea} м²`);
  if (listing.floor && listing.totalFloors) keywords.push(`${listing.floor} этаж`, `${listing.floor}/${listing.totalFloors} этаж`);
  if (listing.yearBuilt) keywords.push(`год постройки ${listing.yearBuilt}`);
  if (listing.condition) keywords.push(`состояние ${listing.condition}`, listing.condition);
  if (listing.landArea) keywords.push(`участок ${listing.landArea} соток`, `${listing.landArea} соток`);

  // Trim to 15 keywords (Google ignores beyond that)
  const keywordsFinal = keywords.slice(0, 15);

  // -------- OG IMAGES --------
  const ogImages = listing.images?.slice(0, 4).map(img => ({
    url: `${baseUrl}/api/image/${img.path}`,
    width: 1200,
    height: 630,
    alt: `${listing.title} - ${listing.address || listing.fullAddress || cityText}`
  }));

  // -------- Metadata Object --------
  const metadata: Metadata = {
    title,
    description,
    keywords: keywordsFinal.join(', '),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/listing/${listing.id}`,
      locale: 'ru_RU',
      type: 'article',
      siteName: 'ОпораДом',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.length > 200 ? description.slice(0, 200) + '…' : description,
      images: ogImages?.[0] ? [ogImages[0].url] : undefined
    },
    other: {
      'format-detection': 'telephone=yes',
      'geo.region': 'RU-KDA',
      'geo.placename': cityText,
      ...(listing.latitude && listing.longitude && {
        'geo.position': `${listing.latitude};${listing.longitude}`
      }),
      'property:city': cityText,
      'property:deal_type': listing.dealType.toLowerCase(),
      'property:type': propertyTypeName,
      'property:category': listing.category?.name || '',
    },
    alternates: {
      canonical: `${baseUrl}/listing/${listing.id}`
    }
  };

  // -------- JSON-LD --------
  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: `${listing.address || listing.title} - ${listing.price.toLocaleString('ru-RU')} ₽`,
    description: listing.publicDescription || listing.title,
    url: `${baseUrl}/listing/${listing.id}`,
    datePosted: listing.dateAdded.toISOString(),
    mainEntity: {
      '@type': listing.category?.slug === 'apartments' ? 'Apartment' : listing.category?.slug === 'houses' ? 'House' : 'Residence',
      address: {
        '@type': 'PostalAddress',
        streetAddress: listing.address || listing.fullAddress,
        addressLocality: cityText,
        addressRegion: 'Краснодарский край',
        addressCountry: 'RU'
      },
      floorSize: listing.houseArea ? { '@type': 'QuantitativeValue', value: listing.houseArea, unitText: 'м²' } : undefined,
    },
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'RUB',
      businessFunction: listing.dealType === 'RENT' ? 'https://schema.org/LeaseOut' : 'https://schema.org/Sell',
      availability: 'https://schema.org/InStock',
    }
  };

  if (listing.images?.length) {
    structuredData['image'] = listing.images.map(img => `${baseUrl}/api/image/${img.path}`);
  }

  return { metadata, jsonLd: structuredData, keywordsArray: keywordsFinal };
} 