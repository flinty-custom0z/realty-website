import { Suspense } from 'react';
import { PrismaClient } from '@prisma/client';
import ListingCard from '@/components/ListingCard';
import FilterSidebarWrapper from '@/components/FilterSidebarWrapper';
import SearchFormWrapper from '@/components/SearchFormWrapper';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getListings(searchParams: Record<string, string | string[] | undefined>) {
  // Build filter object
  const filter: any = { 
    status: 'active',
  };
  
  // Apply search filters
  if (searchParams.q) {
    filter.OR = [
      { title: { contains: searchParams.q as string, mode: 'insensitive' } },
      { publicDescription: { contains: searchParams.q as string, mode: 'insensitive' } },
    ];
  }
  
  // Apply other filters
  if (searchParams.minPrice) {
    filter.price = { ...filter.price, gte: parseFloat(searchParams.minPrice as string) };
  }
  
  if (searchParams.maxPrice) {
    filter.price = { ...filter.price, lte: parseFloat(searchParams.maxPrice as string) };
  }
  
  if (searchParams.rooms) {
    filter.rooms = parseInt(searchParams.rooms as string);
  }
  
  if (searchParams.district) {
    filter.district = { contains: searchParams.district as string, mode: 'insensitive' };
  }
  
  if (searchParams.condition) {
    filter.condition = searchParams.condition as string;
  }
  
  // Category filter if provided
  if (searchParams.category) {
    const category = await prisma.category.findUnique({
      where: { slug: searchParams.category as string },
    });
    if (category) {
      filter.categoryId = category.id;
    }
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
      category: true,
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

// Get all categories for the filter
async function getCategories() {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const { listings, pagination } = await getListings(resolvedSearchParams);
  const categories = await getCategories();
  
  // Get the search query for display
  const searchQuery = resolvedSearchParams.q as string;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {searchQuery 
          ? `Результаты поиска: "${searchQuery}"` 
          : 'Все объявления'}
      </h1>
      
      {/* Search form at the top of results */}
      <div className="w-full max-w-lg mb-6">
        <SearchFormWrapper initialQuery={searchQuery || ''} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <FilterSidebarWrapper 
            categorySlug="" 
            categories={categories}
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
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <a
                    key={page}
                    href={`/search?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(resolvedSearchParams || {}).filter(([key]) => key !== 'page')
                      ),
                      page: page.toString(),
                    })}`}
                    className={`px-4 py-2 text-sm border ${
                      page === pagination.page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </a>
                ))}
              </nav>
            </div>
          )}
          
          {/* No results */}
          {listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">Нет объектов, соответствующих вашим критериям</p>
              <p className="text-sm text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}