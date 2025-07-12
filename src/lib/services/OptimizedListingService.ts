// src/lib/services/OptimizedListingService.ts
import prisma from '@/lib/prisma';
import { cache, CacheService } from '@/lib/cache/redis';
import { Prisma, DealType } from '@prisma/client';

export class OptimizedListingService {
  /**
   * Get listings with caching and optimized queries
   */
  static async getListingsOptimized(params: {
    page?: number;
    limit?: number;
    dealType?: string;
    categorySlug?: string;
    priceMin?: number;
    priceMax?: number;
    districts?: string[];
    conditions?: string[];
    cityIds?: string[];
    propertyTypeIds?: string[];
    sort?: string;
    order?: string;
    searchQuery?: string;
  }) {
    const {
      page = 1,
      limit = 12,
      dealType = 'SALE',
      sort = 'dateAdded',
      order = 'desc',
      ...filters
    } = params;

    // Create cache key
    const cacheKey = CacheService.keys.listings(params);

    // Try to get from cache
    return cache.cached(
      cacheKey,
      async () => {
        // Build optimized where clause
        const where: Prisma.ListingWhereInput = {
          status: 'active',
          dealType: dealType?.toUpperCase() === 'RENT' ? DealType.RENT : DealType.SALE,
        };

        // Add filters
        if (filters.categorySlug) {
          const category = await prisma.category.findUnique({
            where: { slug: filters.categorySlug },
            select: { id: true },
          });
          if (category) {
            where.categoryId = category.id;
          }
        }

        if (filters.priceMin || filters.priceMax) {
          where.price = {};
          if (filters.priceMin) where.price.gte = filters.priceMin;
          if (filters.priceMax) where.price.lte = filters.priceMax;
        }

        if (filters.districts?.length) {
          where.districtId = { in: filters.districts };
        }

        if (filters.conditions?.length) {
          where.condition = { in: filters.conditions };
        }

        if (filters.cityIds?.length) {
          where.cityId = { in: filters.cityIds };
        }

        if (filters.propertyTypeIds?.length) {
          where.typeId = { in: filters.propertyTypeIds };
        }

        // Add search query if provided
        if (filters.searchQuery) {
          where.OR = [
            { title: { contains: filters.searchQuery, mode: 'insensitive' } },
            { publicDescription: { contains: filters.searchQuery, mode: 'insensitive' } },
            { address: { contains: filters.searchQuery, mode: 'insensitive' } },
            { listingCode: { contains: filters.searchQuery, mode: 'insensitive' } },
            { districtRef: { name: { contains: filters.searchQuery, mode: 'insensitive' } } },
          ];
        }

        // Execute optimized query with minimal includes
        const [listings, total] = await prisma.$transaction([
          prisma.listing.findMany({
            where,
            select: {
              id: true,
              title: true,
              price: true,
              currency: true,
              address: true,
              houseArea: true,
              landArea: true,
              dateAdded: true,
              listingCode: true,
              dealType: true,
              // Minimal relations
              category: {
                select: { name: true, slug: true },
              },
              city: {
                select: { name: true },
              },
              propertyType: {
                select: { name: true },
              },
              districtRef: {
                select: { name: true },
              },
              // Only featured image
              images: {
                where: { isFeatured: true },
                select: { path: true },
                take: 1,
              },
            },
            orderBy: { [sort]: order as 'asc' | 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.listing.count({ where }),
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
      },
      300 // Cache for 5 minutes
    );
  }

  /**
   * Get filter options with caching
   */
  static async getFilterOptions(dealType: string = 'SALE') {
    const cacheKey = CacheService.keys.filters(dealType);

    return cache.cached(
      cacheKey,
      async () => {
        const baseFilter = {
          status: 'active',
          dealType: dealType?.toUpperCase() === 'RENT' ? DealType.RENT : DealType.SALE,
        };

        // Parallel queries for all filter options
        const [
          districts,
          cities,
          conditions,
          propertyTypes,
          priceRange,
          categories,
        ] = await prisma.$transaction([
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

          // Available conditions
          prisma.listing.groupBy({
            by: ['condition'],
            where: {
              ...baseFilter,
              condition: { not: null },
            },
            _count: { condition: true },
            orderBy: { condition: 'asc' },
          }),

          // Property types
          prisma.propertyType.findMany({
            where: {
              listings: { some: baseFilter },
            },
            select: {
              id: true,
              name: true,
              slug: true,
              categoryId: true,
              _count: {
                select: {
                  listings: { where: baseFilter },
                },
              },
            },
            orderBy: { name: 'asc' },
          }),

          // Price range
          prisma.listing.aggregate({
            where: baseFilter,
            _min: { price: true },
            _max: { price: true },
          }),

          // Categories
          prisma.category.findMany({
            where: {
              listings: { some: baseFilter },
            },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
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
          districts: districts.filter(d => d._count.listings > 0),
          cities: cities.filter(c => c._count.listings > 0),
          conditions: conditions.filter(c => c._count && typeof c._count === 'object' && 'condition' in c._count && (c._count as { condition: number }).condition > 0),
          propertyTypes: propertyTypes.filter(pt => pt._count.listings > 0),
          categories: categories.filter(c => c._count.listings > 0),
          priceRange: {
            min: priceRange._min.price || 0,
            max: priceRange._max.price || 0,
          },
        };
      },
      600 // Cache for 10 minutes
    );
  }

  /**
   * Get single listing with caching
   */
  static async getListingById(id: string) {
    const cacheKey = CacheService.keys.listing(id);

    return cache.cached(
      cacheKey,
      async () => {
        return prisma.listing.findUnique({
          where: { id },
          include: {
            category: {
              select: { name: true, slug: true },
            },
            city: {
              select: { name: true },
            },
            districtRef: {
              select: { name: true },
            },
            propertyType: {
              select: { name: true },
            },
            images: {
              orderBy: { isFeatured: 'desc' },
            },
          },
        });
      },
      900 // Cache for 15 minutes
    );
  }

  /**
   * Get categories with caching
   */
  static async getCategories() {
    const cacheKey = CacheService.keys.categories();

    return cache.cached(
      cacheKey,
      async () => {
        return prisma.category.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            _count: {
              select: {
                listings: {
                  where: { status: 'active' },
                },
              },
            },
          },
          orderBy: { name: 'asc' },
        });
      },
      1800 // Cache for 30 minutes
    );
  }

  /**
   * Invalidate cache for a specific listing
   */
  static async invalidateListingCache(listingId: string) {
    await cache.invalidate(CacheService.keys.listing(listingId));
    // Also invalidate listings cache (you might want to be more specific)
    await cache.invalidate('listings:*');
    await cache.invalidate('filters:*');
  }

  /**
   * Invalidate all filter caches
   */
  static async invalidateFilterCaches() {
    await cache.invalidate('filters:*');
    await cache.invalidate('listings:*');
    await cache.invalidate(CacheService.keys.categories());
  }
} 