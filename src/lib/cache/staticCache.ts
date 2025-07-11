// src/lib/cache/staticCache.ts
import prisma from '@/lib/prisma';
import { cache } from './redis';
import { DealType } from '@prisma/client';



export class StaticCache {
  /**
   * Cache categories with counts for both sale and rent
   */
  static async getCategories() {
    return cache.cached(
      'categories:all',
      async () => {
        const categories = await prisma.category.findMany({
          include: {
            _count: {
              select: { 
                listings: { 
                  where: { status: 'active' } 
                },
              },
            },
            listings: {
              where: { 
                status: 'active',
              },
              select: {
                dealType: true,
              },
            }
          },
        });
        
        // Custom ordering: Квартиры first, then Дома, then others alphabetically
        const categoryOrder = ['apartments', 'houses', 'land', 'commercial', 'new-construction', 'international'];
        
        const orderedCategories = categories.sort((a, b) => {
          const aIndex = categoryOrder.indexOf(a.slug);
          const bIndex = categoryOrder.indexOf(b.slug);
          
          // If both categories are in the predefined order, sort by that order
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          
          // If only one is in the predefined order, prioritize it
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          
          // If neither is in the predefined order, sort alphabetically
          return a.name.localeCompare(b.name, 'ru');
        });
        
        // Add calculated counts for each deal type
        return orderedCategories.map(category => {
          const saleCount = category.listings.filter(l => l.dealType === DealType.SALE).length;
          const rentCount = category.listings.filter(l => l.dealType === DealType.RENT).length;
          
          return {
            ...category,
            saleCount,
            rentCount,
            listings: undefined, // Remove the listings array to keep the response clean
          };
        });
      },
      600 // Cache for 10 minutes
    );
  }

  /**
   * Cache category by slug
   */
  static async getCategoryBySlug(slug: string) {
    return cache.cached(
      `category:${slug}`,
      async () => {
        return prisma.category.findUnique({
          where: { slug },
          include: {
            _count: {
              select: { listings: { where: { status: 'active' } } }
            }
          }
        });
      },
      600 // Cache for 10 minutes
    );
  }

  /**
   * Cache static listings for homepage
   */
  static async getStaticListings(dealType: 'SALE' | 'RENT', limit: number = 12) {
    const result = await cache.cached(
      `listings:home:${dealType}:${limit}`,
      async () => {
        const listings = await prisma.listing.findMany({
          where: { 
            status: 'active',
            dealType 
          },
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            address: true,
            houseArea: true,
            landArea: true,
            listingCode: true,
            dateAdded: true,
            dealType: true,
            category: {
              select: { name: true, slug: true }
            },
            city: {
              select: { name: true }
            },
            propertyType: {
              select: { name: true }
            },
            districtRef: {
              select: { name: true }
            },
            images: {
              where: { isFeatured: true },
              select: { path: true },
              take: 1
            }
          },
          orderBy: { dateAdded: 'desc' },
          take: limit,
        });

        const total = await prisma.listing.count({
          where: { status: 'active', dealType }
        });

        return {
          listings,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            page: 1,
            limit,
          }
        };
      },
      300 // Cache for 5 minutes
    );

    // Convert string dates back to Date objects after cache retrieval
    if (result?.listings) {
      result.listings = result.listings.map((listing) => ({
        ...listing,
        dateAdded: typeof listing.dateAdded === 'string' ? new Date(listing.dateAdded) : listing.dateAdded
      })) as typeof result.listings;
    }

    return result;
  }

  /**
   * Cache listings for category pages
   */
  static async getCategoryListings(
    categoryId: string, 
    dealType: 'SALE' | 'RENT', 
    page: number = 1, 
    limit: number = 12
  ) {
    const result = await cache.cached(
      `category-listings:${categoryId}:${dealType}:${page}:${limit}`,
      async () => {
        const filter = {
          categoryId,
          status: 'active' as const,
          dealType,
        };
        
        const [listings, total] = await Promise.all([
          prisma.listing.findMany({
            where: filter,
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              address: true,
              houseArea: true,
              landArea: true,
              listingCode: true,
              dateAdded: true,
              dealType: true,
              condition: true,
              category: {
                select: { name: true, slug: true }
              },
              districtRef: {
                select: { name: true }
              },
              city: {
                select: { name: true }
              },
              propertyType: {
                select: { name: true }
              },
              images: {
                select: { path: true, isFeatured: true },
                orderBy: { isFeatured: 'desc' }
              }
            },
            orderBy: { dateAdded: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.listing.count({ where: filter })
        ]);
        
        return {
          listings,
          pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
          }
        };
      },
      300 // Cache for 5 minutes
    );

    // Convert string dates back to Date objects after cache retrieval
    if (result?.listings) {
      result.listings = result.listings.map((listing) => ({
        ...listing,
        dateAdded: typeof listing.dateAdded === 'string' ? new Date(listing.dateAdded) : listing.dateAdded
      })) as typeof result.listings;
    }

    return result;
  }

  /**
   * Cache individual listing by ID
   */
  static async getListingById(id: string) {
    const result = await cache.cached(
      `listing:${id}`,
      async () => {
        return prisma.listing.findUnique({
          where: { id, status: 'active' },
          include: {
            category: true,
            propertyType: true,
            city: true,
            districtRef: true,
            images: {
              orderBy: [
                { isFeatured: 'desc' },
                { id: 'asc' }
              ]
            }
          }
        });
      },
      600 // Cache for 10 minutes
    );

    // Convert string dates back to Date objects after cache retrieval
    if (result && typeof result.dateAdded === 'string') {
      result.dateAdded = new Date(result.dateAdded);
    }

    return result;
  }

  /**
   * Cache filter options for categories
   */
  static async getFilterOptions(categoryId?: string, dealType: 'SALE' | 'RENT' = 'SALE') {
    return cache.cached(
      `filter-options:${categoryId || 'all'}:${dealType}`,
      async () => {
        const baseFilter = {
          status: 'active' as const,
          dealType,
          ...(categoryId && { categoryId }),
        };

        const [districts, cities, propertyTypes] = await Promise.all([
          // Districts with listings count
          prisma.district.findMany({
            where: {
              listings: { some: baseFilter },
            },
            select: {
              id: true,
              name: true,
              slug: true,
              _count: {
                select: {
                  listings: { where: baseFilter },
                },
              },
            },
            orderBy: { name: 'asc' },
          }),

          // Cities with listings count
          prisma.city.findMany({
            where: {
              listings: { some: baseFilter },
            },
            select: {
              id: true,
              name: true,
              slug: true,
              _count: {
                select: {
                  listings: { where: baseFilter },
                },
              },
            },
            orderBy: { name: 'asc' },
          }),

          // Property types with listings count
          prisma.propertyType.findMany({
            where: {
              listings: { some: baseFilter },
            },
            select: {
              id: true,
              name: true,
              categoryId: true,
              _count: {
                select: {
                  listings: { where: baseFilter },
                },
              },
            },
            orderBy: { name: 'asc' },
          }),
        ]);

        return {
          districts,
          cities,
          propertyTypes,
        };
      },
      300 // Cache for 5 minutes
    );
  }

  /**
   * Invalidate cache for a specific listing
   */
  static async invalidateListingCache(listingId: string) {
    await cache.invalidate(`listing:${listingId}`);
    await cache.invalidate('listings:home:*');
    await cache.invalidate('category-listings:*');
  }

  /**
   * Invalidate all category caches
   */
  static async invalidateCategoryCache() {
    await cache.invalidate('categories:*');
    await cache.invalidate('category:*');
    await cache.invalidate('filter-options:*');
  }

  /**
   * Force refresh category cache (useful after ordering changes)
   */
  static async refreshCategoryCache() {
    await this.invalidateCategoryCache();
    // Pre-warm the cache with fresh data
    await this.getCategories();
  }
}

export default StaticCache; 