import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';
import { notFound } from 'next/navigation';
import FilterSidebarWrapper from '@/components/FilterSidebarWrapper';
import Link from 'next/link';
import { headers } from 'next/headers';
import SortSelector from '@/components/SortSelector';
import { Metadata } from 'next';
import Script from 'next/script';
import StructuredDataBreadcrumb from '@/components/StructuredDataBreadcrumb';
import StaticCache from '@/lib/cache/staticCache';

// Wrap the SortSelector in a client component to avoid hydration issues
function SortSelectorWrapper() {
  return (
    <Suspense fallback={<div className="w-48 h-9 bg-gray-100 animate-pulse rounded" />}>
      <SortSelector />
    </Suspense>
  );
}

// Enable ISR with 5 minute revalidation
export const revalidate = 300;

// Pre-generate all category pages at build time
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true }
  });
  
  return categories.map(category => ({
    slug: category.slug
  }));
}

// Generate metadata for the page with proper titles
export async function generateMetadata(
  { params, searchParams }: {
    params: Promise<{ slug: string }>;                     // ← Promise
    searchParams: Promise<{ deal?: string }>;              // ← Promise
  }
): Promise<Metadata> {

  // 1. unwrap both promises
  const { slug }            = await params;
  await searchParams; // no longer needed, but await to comply with function signature

  // 2. fetch category
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: 'Категория не найдена' };

  // 3. build title and description
  let description = category.description ?? `${category.name} в Краснодаре. Выгодные предложения недвижимости от агентства ОпораДом. Звоните: +7(962)444-15-79`;
  
  // Trim description to 160 characters for SEO
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oporadom.ru';

  return {
    title: `${category.name} в Краснодаре`,
    description,
    // Add canonical URL to prevent duplicate content from filters
    alternates: {
      canonical: `${baseUrl}/listing-category/${slug}`,
    },
  };
}

async function getCategory(slug: string) {
  return StaticCache.getCategoryBySlug(slug);
}

async function getListings(
  categoryId: string,
  searchParams: Record<string, string | string[] | undefined>
) {
  // Check if this is a basic category request (no filters/pagination/search)
  const hasFilters = searchParams.page || searchParams.sort || searchParams.order || 
                     searchParams.categoryQuery || searchParams.q || 
                     searchParams.minPrice || searchParams.maxPrice ||
                     searchParams.district || searchParams.condition || 
                     searchParams.city || searchParams.propertyType;
  
  const dealType = searchParams.deal === 'rent' ? 'RENT' : 'SALE';
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  
  // For basic category requests, use StaticCache for optimal performance
  if (!hasFilters) {
    return StaticCache.getCategoryListings(categoryId, dealType, page, 12);
  }

  // For requests with filters, use original logic
  const filter: Record<string, unknown> = { 
    categoryId,
    status: 'active',
    dealType,
  };
  
  // Apply search filters - use categoryQuery, fallback to q for backward compatibility
  const searchTerm = searchParams.categoryQuery || searchParams.q;
  if (searchTerm) {
    filter.OR = [
      { title: { contains: searchTerm as string, mode: 'insensitive' } },
      { publicDescription: { contains: searchTerm as string, mode: 'insensitive' } },
    ];
  }
  
  if (searchParams.minPrice) {
    filter.price = { ...(filter.price || {}), gte: parseFloat(searchParams.minPrice as string) };
  }
  
  if (searchParams.maxPrice) {
    filter.price = { ...(filter.price || {}), lte: parseFloat(searchParams.maxPrice as string) };
  }
  
  if (searchParams.district) {
    const districts = Array.isArray(searchParams.district) 
      ? searchParams.district 
      : [searchParams.district as string];
    
    filter.districtId = { in: districts };
  }
  
  if (searchParams.condition) {
    const conditions = Array.isArray(searchParams.condition) 
      ? searchParams.condition 
      : [searchParams.condition as string];
    
    filter.condition = { in: conditions };
  }
  
  if (searchParams.city) {
    const cities = Array.isArray(searchParams.city) 
      ? searchParams.city 
      : [searchParams.city as string];
    
    filter.cityId = { in: cities };
  }
  
  if (searchParams.propertyType) {
    const propertyTypes = Array.isArray(searchParams.propertyType) 
      ? searchParams.propertyType 
      : [searchParams.propertyType as string];
    
    filter.typeId = { in: propertyTypes };
  }
  
  // Get page number
  const limit = 12;
  
  // Determine sort order
  const sortField = searchParams.sort || 'dateAdded';
  const sortOrder = searchParams.order || 'desc';
  
  // Count total
  const total = await prisma.listing.count({ where: filter });
  
  // Get paginated results
  const listings = await prisma.listing.findMany({
    where: filter,
    include: {
      category: true,  // Include category for reference
      images: true,
      districtRef: true,
      city: true,
      propertyType: true,
    },
    orderBy: {
      [sortField as string]: sortOrder as 'asc' | 'desc',
    },    
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return {
    listings,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}

// Determine if we should show back link (only from global search)
async function shouldShowBackLink(searchParams: Record<string, string | string[] | undefined>) {
  // Check if coming from global search
  const fromGlobalSearch = searchParams.from === 'global-search';
  
  // Check referrer header
  const headersList = await headers();
  const referer = headersList.get('referer');
  const comingFromSearch = referer?.includes('/search');
  
  return fromGlobalSearch || comingFromSearch;
}

export default async function CategoryPage({ 
  params, 
  searchParams,
}: { 
  params: Promise<{ slug: string }>; 
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Set deal type from simplified parameter
  const isRent = resolvedSearchParams.deal === 'rent';
  
  // Add dealType to metadata for proper page title
  const isDealTypeRent = isRent;
  
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }
  
  const { listings, pagination } = await getListings(category.id, resolvedSearchParams);

  // No need for client-side filtering since database query already filters by deal type
  // Use original pagination data from database query
  const adjustedPagination = pagination;

  // Base URL for constructing absolute links
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oporadom.ru';

  // Create breadcrumb data
  const breadcrumbItems = [
    { name: 'Главная', url: `${baseUrl}/` },
    { name: category.name, url: `${baseUrl}/listing-category/${category.slug}` },
  ];

  // Create ItemList structured data for the category page
  const itemListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category.name} в Краснодаре`,
    "description": category.description || `${category.name} в Краснодаре. Выгодные предложения.`,
    "url": `${baseUrl}/listing-category/${category.slug}${isRent ? '?deal=rent' : ''}`,
    "numberOfItems": listings.length,
    "itemListElement": listings.slice(0, 10).map((listing, index) => ({
      "@type": "RealEstateListing",
      "position": index + 1,
      "name": listing.title,
      "url": `${baseUrl}/listing/${listing.id}`,
      "offers": {
        "@type": "Offer",
        "price": listing.price,
        "priceCurrency": "RUB"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Краснодар",
        "addressCountry": "RU"
      }
    }))
  };

  // Get search query if exists (prioritize categoryQuery, fallback to q for backwards compatibility)
  const categorySearchQuery = resolvedSearchParams.categoryQuery as string || '';
  const globalSearchQuery = resolvedSearchParams.q as string || '';
  
  // Use the appropriate search query depending on context
  const searchQuery = globalSearchQuery || '';

  // Determine if we should show back link
  const showBackLink = await shouldShowBackLink(resolvedSearchParams);

  return (
    <>
      <StructuredDataBreadcrumb items={breadcrumbItems} />
      <Script
        id="category-itemlist-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListStructuredData)
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      {isDealTypeRent && (
        <h2 className="text-xl text-gray-600 mb-4">Аренда</h2>
      )}
      
      {/* Show "back to category" link ONLY when coming from global search */}
      {showBackLink && (
        <div className="mb-4">
          <Link 
            href={`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
            className="text-blue-500 hover:text-blue-700 inline-flex items-center"
          >
            <span className="mr-1">←</span> Назад к результатам поиска
          </Link>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <FilterSidebarWrapper 
            categorySlug={slug}
            searchQuery={categorySearchQuery}
            filteredCount={adjustedPagination.total}
          />
        </div>
        
        {/* Listings */}
        <div className="w-full md:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {adjustedPagination.total > 0 ? (
                `Отображаются ${(adjustedPagination.page - 1) * adjustedPagination.limit + 1}-
                ${Math.min(adjustedPagination.page * adjustedPagination.limit, adjustedPagination.total)} из ${adjustedPagination.total} результатов`
              ) : 'Нет результатов'}
            </p>
            <SortSelectorWrapper />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                price={listing.price}
                district={listing.districtRef?.name || undefined}
                address={listing.address || undefined}
                area={listing.houseArea || undefined}
                imagePaths={listing.images
                  ?.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
                  .map(img => img.path) ?? []}
                listingCode={listing.listingCode}
                propertyType={listing.propertyType || undefined}
                category={listing.category || undefined}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {adjustedPagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex flex-wrap justify-center space-x-2">
                {Array.from({ length: adjustedPagination.pages }, (_, i) => i + 1).map((page) => {
                  // Create a new URLSearchParams with all current parameters
                  const params = new URLSearchParams();
                  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
                    if (key !== 'page' && value !== undefined) {
                      if (Array.isArray(value)) {
                        value.forEach(v => params.append(key, v));
                      } else {
                        params.append(key, value);
                      }
                    }
                  });
                  params.set('page', page.toString());
                  
                  return (
                    <a
                      key={page}
                      href={`/listing-category/${slug}?${params.toString()}`}
                      className={`pagination-btn ${
                        page === adjustedPagination.page
                          ? 'pagination-btn-active'
                          : 'pagination-btn-inactive'
                      }`}
                    >
                      {page}
                    </a>
                  );
                })}
              </nav>
            </div>
          )}
          
          {/* No results */}
          {listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">Нет объектов, соответствующих вашим критериям</p>
              <p className="text-sm text-gray-500 mt-2">Попробуйте изменить параметры фильтра</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}