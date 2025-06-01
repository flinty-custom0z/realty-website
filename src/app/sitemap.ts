import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
  
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
  ];
  
  try {
    // Get all active categories
    const categories = await prisma.category.findMany();
    
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
    
    // Get all active listings
    const listings = await prisma.listing.findMany({
      where: { status: 'active' },
      select: { id: true, dateAdded: true },
      take: 1000, // Limit to a reasonable number
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