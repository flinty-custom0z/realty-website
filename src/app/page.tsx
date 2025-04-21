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

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { listings: { where: { status: 'active' } } }, // Only count active listings
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
    <div className="container mx-auto px-4 py-8">
      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => {
          const imageSrc = categoryImages[category.slug as keyof typeof categoryImages] || 
            categoryImages[(category.slug.endsWith('s') ? category.slug.slice(0, -1) : category.slug + 's') as keyof typeof categoryImages] || 
                          defaultPlaceholder;
          return (
          <Link 
            key={category.id}
            href={`/listing-category/${category.slug}`}
            className={`category-card aspect-square sm:aspect-video md:aspect-[4/3] category-${category.slug}`}
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
            <div className="category-card-content h-full flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{category.name}</h2>
              <p className="text-white text-xl">
                {category._count.listings} {getListingText(category._count.listings)}
              </p>
            </div>
          </Link>
          );
        })}
      </div>

      {/* Listings and filters */}
      <ListingsWithFilters
        initialListings={listingsForClient}
        initialPagination={pagination}
        initialFilters={params}
        categories={categories}
      />
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