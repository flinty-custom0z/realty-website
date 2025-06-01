import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import ClientImage from '@/components/ClientImage';
import ListingCard from '@/components/ListingCard';
import FilterSidebarWrapper from '@/components/FilterSidebarWrapper';
import SortSelector from '@/components/SortSelector';
import { Suspense } from 'react';
import ListingsWithFilters from '@/components/ListingsWithFilters';
import DealTypeToggle from '@/components/DealTypeToggle';
import HomeDealTypeToggle from '@/components/HomeDealTypeToggle';
import CategoryTiles from '@/components/CategoryTiles';
import ContactForm from '@/components/ui/ContactForm';
import { Metadata } from 'next';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

// Generate metadata based on deal type
export async function generateMetadata({
  // ✱ params may be omitted if you don't need it
  // params,
  searchParams,
}: {
  // params?: Promise<{ slug: string }>;        // keep if used
  searchParams: Promise<{ deal?: string }>;     // ← Promise!
}): Promise<Metadata> {
  // Unwrap the promise
  const { deal } = await searchParams;

  const isRent = deal === 'rent';

  return {
    title: isRent
      ? 'Недвижимость в Краснодаре — аренда'
      : 'Недвижимость в Краснодаре — продажа',
    description:
      'Найдите идеальную недвижимость для жизни, инвестиций или бизнеса. Большой выбор объектов во всех районах города.',
  };
}

// Map category slugs to their placeholder images - using both plural and singular for redundancy
const categoryImages = {
  'apartments': '/images/apartments_placeholder.png',
  'houses': '/images/houses_placeholder.png',
  'land': '/images/land_placeholder.png',
  'commercial': '/images/commercial_placeholder.png',
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
};

// Add interface for Listing type
interface ListingWithDealType {
  dealType: 'SALE' | 'RENT';
}

// Add interface for Category with counts
interface CategoryWithCounts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    listings: number;
  };
  listings: ListingWithDealType[];
  saleCount?: number;
  rentCount?: number;
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { 
          listings: { 
            where: { status: 'active' } 
          },
        },
      },
      // Get separate counts for SALE and RENT listings
      listings: {
        where: { 
          status: 'active',
        },
        select: {
          dealType: true,
        } as any, // Type assertion to avoid TypeScript error
      }
    },
  });
  
  // Add calculated counts for each deal type
  return (categories as unknown as CategoryWithCounts[]).map(category => {
    const saleCount = category.listings.filter(l => l.dealType === 'SALE').length;
    const rentCount = category.listings.filter(l => l.dealType === 'RENT').length;
    
    return {
      ...category,
      saleCount,
      rentCount,
      listings: undefined, // Remove the listings array to keep the response clean
    };
  });
}

// Fetch all listings with filters/sorting/pagination
async function getListings(searchParams: Record<string, string | string[] | undefined>) {
  // Build filter object (same as search page)
  const filter: any = { 
    status: 'active',
  };

  // Search query
  if (searchParams.q) {
    filter.OR = [
      { title: { contains: searchParams.q as string, mode: 'insensitive' } },
      { publicDescription: { contains: searchParams.q as string, mode: 'insensitive' } },
    ];
  }

  // Deal type filter (unified approach - use only 'deal' parameter)
  if (searchParams.deal === 'rent') {
    filter.dealType = 'RENT';
  } else {
    filter.dealType = 'SALE';
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
    const defaultPlaceholderPath = path.join(publicDir, '/images/placeholder.png');
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
  
  // Determine current deal type from URL query - use only 'deal' parameter
  const isDealRent = resolvedParams.deal === 'rent';
  const dealType = isDealRent ? 'rent' : 'sale';

  // Convert to Prisma enum for database queries
  const dbDealType = isDealRent ? 'RENT' : 'SALE';
  
  // Set params for fetching listings (using only 'deal' parameter)
  const paramsWithDefaults = {
    ...resolvedParams,
    deal: isDealRent ? 'rent' : undefined // Only include deal=rent, omit for sale as default
  };

  // Ensure placeholders exist
  await ensurePlaceholderImages();

  // Get categories to pass to CategoryTiles
  const categories = await getCategories();

  // Get listings for the main page (with filters/sort/pagination)
  const { listings, pagination } = await getListings(paramsWithDefaults);
  
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
      
      {/* Deal Type Toggle and Categories Section */}
      <div className="mb-14 md:mb-20">
        {/* Client-side DealTypeToggle will be rendered with context integration */}
        <HomeDealTypeToggle />
        
        <CategoryTiles initialCategories={categories} />
      </div>

      {/* Featured listings section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <Link href={{
            pathname: "/search",
            query: { deal: isDealRent ? 'rent' : undefined }
          }} className="mt-2 sm:mt-0 text-sm text-gray-600 hover:text-gray-900">
            Показать все предложения →
          </Link>
        </div>

        {/* Listings and filters */}
        <ListingsWithFilters
          initialListings={listingsForClient}
          initialPagination={pagination}
          initialFilters={paramsWithDefaults}
          categories={[]} // We don't need to pass categories here now
        />
      </div>
      
      {/* Contact form section */}
      <div className="my-16 max-w-4xl mx-auto">
        <ContactForm />
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