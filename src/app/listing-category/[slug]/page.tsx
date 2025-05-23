import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';
import { notFound } from 'next/navigation';
import FilterSidebarWrapper from '@/components/FilterSidebarWrapper';
import Link from 'next/link';
import { headers } from 'next/headers';
import SortSelector from '@/components/SortSelector';
import { Metadata } from 'next';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

// Generate metadata for the page with proper titles
export async function generateMetadata(
  { params, searchParams }: {
    params: Promise<{ slug: string }>;                     // ← Promise
    searchParams: Promise<{ deal?: string }>;              // ← Promise
  }
): Promise<Metadata> {

  // 1. unwrap both promises
  const { slug }            = await params;
  const { deal }            = await searchParams;

  // 2. fetch category
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: 'Категория не найдена' };

  // 3. tailor title by deal type
  const isRent = deal === 'rent';
  return {
    title: isRent
      ? `${category.name} — аренда в Краснодаре`
      : `${category.name} — продажа в Краснодаре`,
    description:
      category.description
        ?? `${category.name} в Краснодаре. Выгодные предложения.`,
  };
}

// // Helper function to handle Russian grammatical cases
function getDativeCase(categoryName: string): string {
  // Handle Russian declensions for common category names
  const dative: Record<string, string> = {
    'Квартиры': 'квартирам',
    'Дома': 'домам',
    'Земельные участки': 'земельным участкам',
    'Коммерция': 'коммерческим объектам',
    'Промышленные объекты': 'промышленным объектам'
  };
  
  return dative[categoryName] || categoryName.toLowerCase();
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  
  return category;
}

async function getListings(
  categoryId: string,
  searchParams: Record<string, string | string[] | undefined>
) {
  // Build filter object
  const filter: any = { 
    categoryId,
    status: 'active',
  };
  
  // Deal type filter (simplified to use only 'deal' parameter)
  if (searchParams.deal === 'rent') {
    filter.dealType = 'RENT';
  } else {
    filter.dealType = 'SALE';
  }
  
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
  
  // Multi-room selection support
  const roomParams = searchParams.rooms;
  if (roomParams) {
    // Handle both array and single value cases
    const roomValues = Array.isArray(roomParams) 
      ? roomParams.map(r => parseInt(r)) 
      : [parseInt(roomParams as string)];
    
    if (roomValues.some(v => !isNaN(v))) {
      filter.rooms = { in: roomValues.filter(v => !isNaN(v)) };
    }
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
  
  // Get page number
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const limit = 30;
  
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
  const dealType = isRent ? 'RENT' : 'SALE';
  
  // Add dealType to metadata for proper page title
  const isDealTypeRent = isRent;
  
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }
  
  const { listings: unfilteredListings, pagination } = await getListings(category.id, resolvedSearchParams);

  // Additional client-side filtering to ensure correct deal type
  const listings = unfilteredListings.filter((listing: any) => 
    listing.dealType === dealType
  );

  // Update pagination total if we filtered listings
  const adjustedPagination = {
    ...pagination,
    total: listings.length
  };

  // Get search query if exists (prioritize categoryQuery, fallback to q for backwards compatibility)
  const categorySearchQuery = resolvedSearchParams.categoryQuery as string || '';
  const globalSearchQuery = resolvedSearchParams.q as string || '';
  
  // Use the appropriate search query depending on context
  const searchQuery = globalSearchQuery || '';

  // Determine if we should show back link
  const showBackLink = await shouldShowBackLink(resolvedSearchParams);

  return (
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
            <SortSelector />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                price={listing.price}
                district={listing.districtRef?.name || undefined}
                address={listing.address || undefined}
                rooms={listing.rooms || undefined}
                area={listing.houseArea || undefined}
                imagePaths={listing.images
                  ?.sort((a, b) => (a.isFeatured ? -1 : b.isFeatured ? 1 : 0))
                  .map(img => img.path) ?? []}
                listingCode={listing.listingCode}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {adjustedPagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex">
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
                      className={`px-4 py-2 text-sm border ${
                        page === adjustedPagination.page
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
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
  );
}