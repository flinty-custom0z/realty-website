import { prisma } from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';
import FilterSidebarWrapper from '@/components/FilterSidebarWrapper';
import Link from 'next/link';
import SortSelector from '@/components/SortSelector';

// Force dynamic rendering so every request is fresh
export const dynamic = 'force-dynamic';

/**
 * Helper function to get proper grammatical case for back links
 */
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

  // Multi‑category support - more robust handling
  const categoryParams = searchParams.category;
  if (categoryParams) {
    // Ensure we have an array of category slugs regardless of input format
    let categorySlugs: string[] = [];
    
    if (Array.isArray(categoryParams)) {
      // If it's already an array, use all values
      categorySlugs = categoryParams.filter(Boolean);
    } else if (typeof categoryParams === 'string') {
      // If it's a single string, check if it contains commas (CSV format)
      if (categoryParams.includes(',')) {
        categorySlugs = categoryParams.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        categorySlugs = [categoryParams];
      }
    }
    
    if (categorySlugs.length > 0) {
      const cats = await prisma.category.findMany({ 
        where: { slug: { in: categorySlugs } }, 
        select: { id: true } 
      });
      
      if (cats.length > 0) {
      filter.categoryId = { in: cats.map((c) => c.id) };
      }
    }
  }

  // Numeric filters (price)
  if (searchParams.minPrice) {
    filter.price = { ...(filter.price || {}), gte: parseFloat(searchParams.minPrice as string) };
  }
  if (searchParams.maxPrice) {
    filter.price = { ...(filter.price || {}), lte: parseFloat(searchParams.maxPrice as string) };
  }

  if (searchParams.district) {
    const districtParams = Array.isArray(searchParams.district) ? searchParams.district : [searchParams.district];
    filter.districtId = { in: districtParams };
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
        images: true,
        districtRef: true,
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
 * Determine where to go back to based on URL parameters
 */
function getBackDestination(searchParams: Record<string, string | string[] | undefined>) {
  // First priority: explicit return URL
  if (searchParams.returnUrl) {
    try {
      return decodeURIComponent(searchParams.returnUrl as string);
    } catch (e) {
      console.error("Failed to decode returnUrl", e);
    }
  }
  
  // Second priority: category from 'from' parameter
  if (searchParams.from && typeof searchParams.from === 'string' && searchParams.from.startsWith('category:')) {
    const categorySlug = searchParams.from.split(':')[1];
    if (categorySlug) {
    return `/listing-category/${categorySlug}`;
  }
  }
  
  // Third priority: single selected category
  const categoryParam = searchParams.category;
  if (categoryParam && !Array.isArray(categoryParam)) {
    return `/listing-category/${categoryParam}`;
  }
  
  // Default fallback
  return '/';
}

/**
 * Get display text for back link with proper grammatical case
 */
async function getBackLinkText(backUrl: string) {
  // If returning to home
  if (backUrl === '/') {
    return 'На главную';
  }
  
  // If returning to a category
  if (backUrl.startsWith('/listing-category/')) {
    const categorySlug = backUrl.split('/')[2]?.split('?')[0];
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        return `Назад к ${getDativeCase(category.name)}`;
      }
    }
  }
  
  // Default
  return 'Назад';
}

/**
 * Get all categories for the filter sidebar
 */
async function getAllCategories(searchParams: Record<string, string | string[] | undefined>) {
  // Create base filter
  const baseFilter: any = { status: 'active' };
  
  // Add search query filter if present
  if (searchParams.q) {
    baseFilter.OR = [
      { title: { contains: searchParams.q as string, mode: 'insensitive' } },
      { publicDescription: { contains: searchParams.q as string, mode: 'insensitive' } },
    ];
  }
  
  // Find categories that have matching listings
  return prisma.category.findMany({
    where: {
      listings: {
        some: baseFilter
      }
    },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { 
          listings: { where: { status: 'active' } }
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
  // Update how categories are retrieved
  const categories = await getAllCategories(resolvedParams);
  
  const searchQuery = resolvedParams.q as string | undefined;
  
  // Get back navigation info
  const backUrl = getBackDestination(resolvedParams);
  const backLinkText = await getBackLinkText(backUrl);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Все объявления'}
      </h1>
      
      {/* Back link - always show for search results */}
        <div className="mb-4">
          <Link 
            href={backUrl}
            className="text-blue-500 hover:text-blue-700 inline-flex items-center"
          >
            <span className="mr-1">←</span> {backLinkText}
          </Link>
        </div>
      
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
            <SortSelector />
          </div>
          
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                id={l.id}
                price={l.price}
                district={l.districtRef || undefined}
                address={l.address || undefined}
                area={l.houseArea || undefined}
                imagePaths={l.images
                  ?.sort((a, b) => (a.isFeatured ? -1 : b.isFeatured ? 1 : 0))
                  .map(img => img.path) ?? []}
                listingCode={l.listingCode}
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