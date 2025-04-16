import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import ClientImage from '@/components/ClientImage';

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

// Validate that all placeholder images exist
async function ensurePlaceholderImages() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    
    // Create images directory if it doesn't exist
    const imagesDir = path.join(publicDir, 'images');
    try {
      await fs.access(imagesDir);
    } catch (error) {
      await fs.mkdir(imagesDir, { recursive: true });
      console.log('Created images directory');
    }
    
    // Check if default placeholder exists
    const defaultPlaceholderPath = path.join(publicDir, defaultPlaceholder);
    try {
      await fs.access(defaultPlaceholderPath);
    } catch (error) {
      console.log('Default placeholder image does not exist');
      // In production we'd create a placeholder here
    }
  } catch (error) {
    console.error('Error ensuring placeholder images:', error);
  }
}

export default async function Home() {
  // Get categories and ensure placeholders exist
  const [categories] = await Promise.all([
    getCategories(),
    ensurePlaceholderImages()
  ]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          // Try both plural and singular versions of image paths
          const imageSrc = categoryImages[category.slug as keyof typeof categoryImages] || 
                          categoryImages[(category.slug.endsWith('s') ? 
                                         category.slug.slice(0, -1) : 
                                         category.slug + 's') as keyof typeof categoryImages] || 
                          defaultPlaceholder;
          
          return (
          <Link 
            key={category.id}
            href={`/listing-category/${category.slug}`}
            className={`category-card aspect-square sm:aspect-video md:aspect-[4/3] category-${category.slug}`}
          >
            {/* Use category placeholder image as background with client component */}
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