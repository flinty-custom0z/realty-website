import { PrismaClient } from '@prisma/client';
import ListingCard from '@/components/ListingCard';
import FilterSidebarWrapper from '@/components/FilterSidebarWrapper';
import SearchFormWrapper from '@/components/SearchFormWrapper';
import Link from 'next/link';

// Force dynamic rendering so every request is fresh
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * Build Prisma-compatible filter object from URL query params
 */
async function buildFilter(searchParams: Record<string, string | string[] | undefined>) {
  const filter: any = { status: 'active' };

  // Full‑text search
  if (searchParams.q) {
    filter.OR = [
      { title: { contains: searchParams.q as string, mode: 'insensitive' } },
      { publicDescription: { contains: searchParams.q as string, mode: 'insensitive' } },
    ];
  }

  // Multi‑category support  — handles `?category=houses&category=land`
  const categoryParams = searchParams.category;
  if (categoryParams) {
    const slugs = Array.isArray(categoryParams) ? categoryParams : [categoryParams];
    const cats = await prisma.category.findMany({ where: { slug: { in: slugs } }, select: { id: true } });
    if (cats.length) {
      filter.categoryId = { in: cats.map((c) => c.id) };
    }
  }

  // Numeric filters (price, rooms)
  if (searchParams.minPrice) {
    filter.price = { ...(filter.price || {}), gte: parseFloat(searchParams.minPrice as string) };
  }
  if (searchParams.maxPrice) {
    filter.price = { ...(filter.price || {}), lte: parseFloat(searchParams.maxPrice as string) };
  }

  const roomParams = searchParams.rooms;
  if (roomParams) {
    const roomsArr = Array.isArray(roomParams) ? roomParams : [roomParams];
    const values = roomsArr.map((r) => parseInt(r)).filter(Boolean);
    if (values.length) filter.rooms = { in: values };
  }

  if (searchParams.district) {
    const dists = Array.isArray(searchParams.district) ? searchParams.district : [searchParams.district];
    filter.district = { in: dists };
  }

  if (searchParams.condition) {
    const conds = Array.isArray(searchParams.condition) ? searchParams.condition : [searchParams.condition];
    filter.condition = { in: conds };
  }

  return filter;
}

/**
 * Fetch listings with pagination.
 */
async function getListings(searchParams: Record<string, string | string[] | undefined>) {
  const filter = await buildFilter(searchParams);

  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const limit = 30;
  
  // simple sort implementation (extend as required)
  const sortField = (searchParams.sort as string) || 'dateAdded';
  const sortOrder = (searchParams.order as string) === 'asc' ? 'asc' : 'desc';
  
  const [total, listings] = await Promise.all([
    prisma.listing.count({ where: filter }),
    prisma.listing.findMany({
      where: filter,
      include: {
        category: true,
        images: { where: { isFeatured: true }, take: 1 },
      },
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  
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

/**
 * Check if search originated from a category page
 */
function getOriginatingCategory(searchParams: Record<string, string | string[] | undefined>) {
  const referrer = searchParams.from as string;
  if (referrer && referrer.startsWith('category:')) {
    return referrer.split(':')[1];
  }
  
  // If we have exactly one category selected, we can consider that as the originating category
  const categoryParam = searchParams.category;
  if (categoryParam && !Array.isArray(categoryParam)) {
    return categoryParam;
  }
  
  return null;
}

/**
 * Get all categories for the filter sidebar
 */
async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { 
          listings: {
            where: { status: 'active' }
          }
        }
      }
    }
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const { listings, pagination } = await getListings(resolvedParams);
  const categories = await getAllCategories();
  
  const searchQuery = resolvedParams.q as string | undefined;
  
  // Check if search originated from a category page
  const originatingCategory = getOriginatingCategory(resolvedParams);
  
  // If there's an originating category, get its name
  let categoryName = '';
  if (originatingCategory) {
    const category = await prisma.category.findUnique({
      where: { slug: originatingCategory },
    });
    if (category) {
      categoryName = category.name.toLowerCase();
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Все объявления'}
      </h1>
      
      {/* Back link - always show for search results */}
      {searchQuery && (
        <div className="mb-4">
          {originatingCategory ? (
          <Link 
            href={`/listing-category/${originatingCategory}`} 
            className="text-blue-500 hover:text-blue-700 inline-flex items-center"
          >
            <span className="mr-1">←</span> Назад к {categoryName || 'категории'}
          </Link>
          ) : (
            <Link 
              href="/" 
              className="text-blue-500 hover:text-blue-700 inline-flex items-center"
            >
              <span className="mr-1">←</span> На главную
            </Link>
          )}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <FilterSidebarWrapper 
            categories={categories} 
            categorySlug="" 
            searchQuery={searchQuery} 
          />
        </div>
        
        {/* Listings */}
        <div className="w-full md:w-3/4">
          {/* Result meta & sort */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {pagination.total > 0
                ? `Отображаются ${(pagination.page - 1) * pagination.limit + 1}‑${Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )} из ${pagination.total} результатов`
                : 'Нет результатов'}
            </p>
            {/* TODO: hook up sort selector */}
            <select defaultValue="dateAdded_desc" className="border rounded p-2 text-sm">
              <option value="dateAdded_desc">Дата (новые)</option>
              <option value="price_asc">Цена (от низкой)</option>
              <option value="price_desc">Цена (от высокой)</option>
            </select>
          </div>
          
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                id={l.id}
                title={l.title}
                price={l.price}
                district={l.district || undefined}
                rooms={l.rooms || undefined}
                area={l.houseArea || undefined}
                floor={l.floor || undefined}
                totalFloors={l.totalFloors || undefined}
                condition={l.condition || undefined}
                imagePath={l.images[0]?.path}
                listingCode={l.listingCode}
                categoryName={l.category.name}
                showCategory={true}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => {
                  const params = new URLSearchParams();
                  Object.entries(resolvedParams).forEach(([k, v]) => {
                    if (k === 'page') return;
                    if (Array.isArray(v)) v.forEach((val) => params.append(k, val));
                    else if (v !== undefined) params.append(k, v);
                  });
                  params.set('page', pageNum.toString());
                  return (
                    <a
                      key={pageNum}
                      href={`/search?${params.toString()}`}
                      className={`px-4 py-2 text-sm border ${
                        pageNum === pagination.page ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
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
              <p className="text-sm text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}