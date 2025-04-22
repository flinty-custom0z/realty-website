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
    <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 6H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 10H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 14H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 18H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'houses': (
    <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10.25V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V10.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 3L2 10.25H22L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 14H15V21H9V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'land': (
    <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 22L12 2L22 22H2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 18H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'commercial': (
    <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 21V7L13 3V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 21V11L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 9V9.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 13V13.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17V17.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'industrial': (
    <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 9L12 5L2 9V19L12 23L22 19V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 5V23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 9L12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 13L22 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
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
      <div className="mb-20">
        <h2 className="text-2xl font-medium text-gray-800 mb-8">Категории недвижимости</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const imageSrc = categoryImages[category.slug as keyof typeof categoryImages] || 
              categoryImages[(category.slug.endsWith('s') ? category.slug.slice(0, -1) : category.slug + 's') as keyof typeof categoryImages] || 
              defaultPlaceholder;
              
            const icon = categoryIcons[category.slug] || categoryIcons['apartments'];
              
            return (
              <Link 
                key={category.id}
                href={`/listing-category/${category.slug}`}
                className="category-card group"
              >
                <div className="absolute inset-0 w-full h-full">
                  <ClientImage
                    src={imageSrc}
                    alt={category.name}
                    fill
                    className="object-cover"
                    priority
                    fallbackSrc={defaultPlaceholder}
                  />
                </div>
                <div className="category-card-content h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="text-white">{icon}</div>
                  <h3 className="text-xl font-medium text-white mb-2">{category.name}</h3>
                  <p className="text-white text-md opacity-90">
                    {category._count.listings} {getListingText(category._count.listings)}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-block px-4 py-2 bg-white text-gray-800 rounded-md text-sm font-medium">
                      Смотреть все
                    </span>
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