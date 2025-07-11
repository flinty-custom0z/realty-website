import Link from 'next/link';
import prisma from '@/lib/prisma';
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
import { OptimizedListingService } from '@/lib/services/OptimizedListingService';
import { DealType } from '@prisma/client';

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

  // Base site title without deal-type suffix (SEO: avoid ", продажа/аренда" in SERP)
  return {
    title: 'Недвижимость в Краснодаре',
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
  dealType: DealType;
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
    const saleCount = category.listings.filter(l => l.dealType === DealType.SALE).length;
    const rentCount = category.listings.filter(l => l.dealType === DealType.RENT).length;
    
    return {
      ...category,
      saleCount,
      rentCount,
      listings: undefined, // Remove the listings array to keep the response clean
    };
  });
}

// Fetch all listings with filters/sorting/pagination using OptimizedListingService
async function getListings(searchParams: Record<string, string | string[] | undefined>) {
  // Parse parameters
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const limit = 12;
  const sort = (searchParams.sort as string) || 'dateAdded';
  const order = (searchParams.order as string) === 'asc' ? 'asc' : 'desc';
  
  // Convert multi-select parameters to arrays
  const districts = searchParams.district ? 
    (Array.isArray(searchParams.district) ? searchParams.district : [searchParams.district]) : 
    undefined;
  const conditions = searchParams.condition ? 
    (Array.isArray(searchParams.condition) ? searchParams.condition : [searchParams.condition]) : 
    undefined;
  const cityIds = searchParams.city ? 
    (Array.isArray(searchParams.city) ? searchParams.city : [searchParams.city]) : 
    undefined;

  // Use OptimizedListingService with caching
  const result = await OptimizedListingService.getListingsOptimized({
    page,
    limit,
    sort,
    order,
    dealType: searchParams.deal as string || undefined,
    searchQuery: searchParams.q as string || undefined,
    priceMin: searchParams.minPrice ? parseFloat(searchParams.minPrice as string) : undefined,
    priceMax: searchParams.maxPrice ? parseFloat(searchParams.maxPrice as string) : undefined,
    districts,
    conditions,
    cityIds,
  });

  return result;
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
      <div className="mb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">Недвижимость в Краснодаре</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Найдите идеальную недвижимость для жизни, инвестиций или бизнеса. Большой выбор объектов во всех районах города.
          </p>
        </div>
        
        {/* Value Proposition Card with animation */}
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="bg-gradient-to-r from-[#11535F]/5 to-emerald-50 rounded-xl p-6 border border-[#11535F]/20 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#11535F]/30">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 hidden sm:block">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-[#11535F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-gray-700 leading-relaxed">
                  На сайте представлена лишь часть предложений. Мы имеем доступ ко всем закрытым базам и прямые договоры с застройщиками, что позволяет найти идеальный вариант <span className="font-semibold text-[#11535F]">абсолютно без комиссии</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
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