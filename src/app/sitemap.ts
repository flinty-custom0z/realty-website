import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { StaticCache } from '@/lib/cache/staticCache';

// Revalidate sitemap every 5 minutes
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oporadom.ru';
  
  // Add static pages - these will always be included
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?deal=rent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
  
  try {
    // Get all active categories using cache
    const categories = await StaticCache.getCategories();
    
    // Generate category URLs with both variants (sale and rent)
    const categoryUrls: MetadataRoute.Sitemap = categories.flatMap((category) => [
      // Sale URLs (default)
      {
        url: `${baseUrl}/listing-category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      // Rent URLs
      {
        url: `${baseUrl}/listing-category/${category.slug}?deal=rent`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }
    ]);
    
    // Get all active listings for sitemap
    const listings = await prisma.listing.findMany({
      where: { status: 'active' },
      select: { id: true, dateAdded: true },
      take: 1000, // Limit to a reasonable number
      orderBy: { dateAdded: 'desc' }, // Most recent first
    });
    
    const listingUrls: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${baseUrl}/listing/${listing.id}`,
      lastModified: listing.dateAdded,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    
    // Return all URLs if database connection is successful
    return [...staticUrls, ...categoryUrls, ...listingUrls];
  } catch (error) {
    console.error('Error generating sitemap with dynamic data:', error);
    // If database connection fails, return just the static URLs
    return staticUrls;
  }
} 