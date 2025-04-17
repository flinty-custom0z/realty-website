import { Suspense } from 'react';
import { PrismaClient } from '@prisma/client';
import ListingCard from '@/components/ListingCard';
import { notFound } from 'next/navigation';
import FilterSidebarWrapper from '@/components/FilterSidebarWrapper';
import Link from 'next/link';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

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
  
  // Apply search filters
  if (searchParams.q) {
    filter.OR = [
      { title: { contains: searchParams.q as string, mode: 'insensitive' } },
      { publicDescription: { contains: searchParams.q as string, mode: 'insensitive' } },
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
    
    filter.district = { in: districts };
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
      images: {
        where: { isFeatured: true },
        take: 1,
      },
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

export default async function Page({ 
  params, 
  searchParams,
}: { 
  params: Promise<{ slug: string }>; 
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const category = await getCategory(slug);
  
  if (!category) {
    notFound();
  }
  
  const { listings, pagination } = await getListings(category.id, resolvedSearchParams);

  // Get search query if exists
  const searchQuery = resolvedSearchParams.q as string || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{category.name}</h1>
      
      {/* Show "back to category" link when search is active */}
      {searchQuery && (
        <div className="mb-4">
          <Link 
            href={`/listing-category/${slug}`} 
            className="text-blue-500 hover:text-blue-700 inline-flex items-center"
          >
            <span className="mr-1">←</span> Вернуться к {category.name.toLowerCase()}
          </Link>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <FilterSidebarWrapper 
            categorySlug={slug}
            searchQuery={searchQuery}
          />
        </div>
        
        {/* Listings */}
        <div className="w-full md:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {pagination.total > 0 ? (
                `Отображаются ${(pagination.page - 1) * pagination.limit + 1}-
                ${Math.min(pagination.page * pagination.limit, pagination.total)} из ${pagination.total} результатов`
              ) : 'Нет результатов'}
            </p>
            
            <select 
              className="border rounded p-2"
              // This would need client-side JS to handle the sorting
            >
              <option value="dateAdded_desc">Дата (новые)</option>
              <option value="price_asc">Цена (от низкой)</option>
              <option value="price_desc">Цена (от высокой)</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                district={listing.district || undefined}
                rooms={listing.rooms || undefined}
                area={listing.houseArea || undefined}
                floor={listing.floor || undefined}
                totalFloors={listing.totalFloors || undefined}
                condition={listing.condition || undefined}
                imagePath={listing.images[0]?.path}
                listingCode={listing.listingCode}
                categoryName={listing.category.name}
                showCategory={false} // Don't show category on category-specific pages
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => {
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
                        page === pagination.page
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