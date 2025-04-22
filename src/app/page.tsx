import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import ClientImage from '@/components/ClientImage';
import ListingCard from '@/components/ListingCard';
import FilterSidebarWrapper from '@/components/FilterSidebarWrapper';
import SortSelector from '@/components/SortSelector';
import { Suspense } from 'react';
import ListingsWithFilters from '@/components/ListingsWithFilters';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Map category slugs to their placeholder images - using both plural and singular for redundancy
const categoryImages = {
  'apartments': '/images/apartments_placeholder.png',
  'houses': '/images/houses_placeholder.png',
  'land': '/images/land_placeholder.png',
  'commercial': '/images/commercial_placeholder.png',
  'industrial': '/images/industrial_placeholder.png',
  // Singular backups
  'apartment': '/images/apartment_placeholder.png',
  'house': '/images/house_placeholder.png',
};

// Default fallback image if a specific category image is not found
const defaultPlaceholder = '/images/placeholder.png';

// Mapping for category icons (SVG paths)
const categoryIcons: Record<string, React.ReactNode> = {
  'apartments': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="2.2"/><path d="M14 13H26M14 19H26M14 25H26M14 31H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg></span>
  ),
  'houses': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 18V33a2 2 0 002 2h20a2 2 0 002-2V18" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M20 7L6 18h28L20 7z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><rect x="15" y="24" width="10" height="11" stroke="currentColor" strokeWidth="2.2"/></svg></span>
  ),
  'land': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="20,7 4,33 36,33" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M20 27h8M12 21h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg></span>
  ),
  'commercial': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="10" height="20" stroke="currentColor" strokeWidth="2.2"/><rect x="22" y="16" width="10" height="14" stroke="currentColor" strokeWidth="2.2"/><path d="M4 36h32" stroke="currentColor" strokeWidth="2.2"/></svg></span>
  ),
  'industrial': (
    <span className="category-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="18" width="28" height="15" rx="2" stroke="currentColor" strokeWidth="2.2"/><path d="M12 18V12a2 2 0 012-2h2a2 2 0 012 2v6M24 18V10a2 2 0 012-2h2a2 2 0 012 2v8" stroke="currentColor" strokeWidth="2.2"/></svg></span>
  ),
};

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { listings: { where: { status: 'active' } } },
      },
    },
  });
  
  return categories;
}

// Fetch all listings with filters/sorting/pagination
async function getListings(searchParams: Record<string, string | string[] | undefined>) {
  // Build filter object (same as search page)
  const filter: any = { status: 'active' };

  // Search query
  if (searchParams.q) {
    filter.OR = [
      { title: { contains: searchParams.q as string, mode: 'insensitive' } },
      { publicDescription: { contains: searchParams.q as string, mode: 'insensitive' } },
    ];
  }

  // Numeric filters
  if (searchParams.minPrice) {
    filter.price = { ...(filter.price || {}), gte: parseFloat(searchParams.minPrice as string) };
  }
  if (searchParams.maxPrice) {
    filter.price = { ...(filter.price || {}), lte: parseFloat(searchParams.maxPrice as string) };
  }

  // Multi-select filters
  if (searchParams.district) {
    const dists = Array.isArray(searchParams.district) ? searchParams.district : [searchParams.district];
    filter.district = { in: dists };
  }
  if (searchParams.condition) {
    const conds = Array.isArray(searchParams.condition) ? searchParams.condition : [searchParams.condition];
    filter.condition = { in: conds };
  }
  if (searchParams.rooms) {
    const roomsArr = Array.isArray(searchParams.rooms) ? searchParams.rooms : [searchParams.rooms];
    const values = roomsArr.map((r) => parseInt(r as string)).filter(Boolean);
    if (values.length) filter.rooms = { in: values };
  }

  // Pagination
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const limit = 30;

  // Sorting
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

// Validate that all placeholder images exist
async function ensurePlaceholderImages() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'images');
    try {
      await fs.access(imagesDir);
    } catch (error) {
      await fs.mkdir(imagesDir, { recursive: true });
      console.log('Created images directory');
    }
    const defaultPlaceholderPath = path.join(publicDir, defaultPlaceholder);
    try {
      await fs.access(defaultPlaceholderPath);
    } catch (error) {
      console.log('Default placeholder image does not exist');
    }
  } catch (error) {
    console.error('Error ensuring placeholder images:', error);
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Await searchParams as required by Next.js app directory
  const resolvedParams = await searchParams;

  // Get categories and ensure placeholders exist
  const [categories] = await Promise.all([
    getCategories(),
    ensurePlaceholderImages()
  ]);

  // Get listings for the main page (with filters/sort/pagination)
  const params = resolvedParams || {};
  const { listings, pagination } = await getListings(params);
  
  // Convert dateAdded (and any other Date fields) to string for ListingsWithFilters
  const listingsForClient = listings.map((l: any) => ({
    ...l,
    dateAdded: l.dateAdded instanceof Date ? l.dateAdded.toISOString() : l.dateAdded,
  }));

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Hero section */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">Недвижимость в Краснодаре</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Найдите идеальную недвижимость для жизни, инвестиций или бизнеса. Большой выбор объектов во всех районах города.</p>
      </div>
      
      {/* Categories */}
      <div className="mb-14 md:mb-20">
        <h2 className="text-2xl font-medium text-gray-800 mb-8">Категории недвижимости</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {categories.map((category) => {
            const imageSrc = categoryImages[category.slug as keyof typeof categoryImages] || 
              categoryImages[(category.slug.endsWith('s') ? category.slug.slice(0, -1) : category.slug + 's') as keyof typeof categoryImages] || 
              defaultPlaceholder;
            const icon = categoryIcons[category.slug] || categoryIcons['apartments'];
            const categoryBgClass = `category-${category.slug}`;
            return (
              <Link 
                key={category.id}
                href={`/listing-category/${category.slug}`}
                className={`category-card group ${categoryBgClass}`}
                style={{ height: '220px' }}
              >
                {/* Background image with overlay for premium look */}
                <div className="absolute inset-0 w-full h-full z-0">
                  <ClientImage
                    src={imageSrc}
                    alt={category.name}
                    fill
                    className="object-cover opacity-40"
                    priority
                    fallbackSrc={defaultPlaceholder}
                  />
                </div>
                <div className="category-card-content">
                  <div className="category-icon">{icon}</div>
                  <div className="category-title">{category.name}</div>
                  <div className="category-count">
                    {category._count.listings} {getListingText(category._count.listings)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured listings section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h2 className="text-2xl font-medium text-gray-800">Популярные предложения</h2>
          <Link href="/search" className="mt-2 sm:mt-0 text-sm text-gray-600 hover:text-gray-900">
            Показать все предложения →
          </Link>
        </div>

        {/* Listings and filters */}
        <ListingsWithFilters
          initialListings={listingsForClient}
          initialPagination={pagination}
          initialFilters={params}
          categories={categories}
        />
      </div>
    </div>
  );
}

function getListingText(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'объявление';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'объявления';
  } else {
    return 'объявлений';
  }
}