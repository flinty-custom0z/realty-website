// src/lib/services/FilterService.ts - Fixed version
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logging';

const logger = createLogger('FilterService');

export interface FilterParams {
  categoryParams?: string[];
  searchQuery?: string | null;
  categoryQuery?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  districtIds?: string[];
  conditions?: string[];
  rooms?: string[];
  dealType?: string | null;
  applyPriceFilter?: boolean;
}

export interface FilterOptions {
  districts: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
    available: boolean;
  }>;
  conditions: Array<{
    value: string;
    count: number;
    available: boolean;
  }>;
  rooms: Array<{
    value: string;
    count: number;
    available: boolean;
  }>;
  dealTypes: Array<{
    value: string;
    label: string;
    count: number;
    available: boolean;
  }>;
  priceRange: {
    min: number;
    max: number;
    currentMin: number | null;
    currentMax: number | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    count: number;
    available: boolean;
  }>;
  totalCount: number;
  hasFiltersApplied: boolean;
}

export class FilterService {
  /**
   * Parse filter parameters from a request
   */
  static parseParams(req: NextRequest): FilterParams {
    const { searchParams } = new URL(req.url);
    
    const category = searchParams.get('category');
    const categoryParams = category ? [category] : searchParams.getAll('category');
    
    return {
      categoryParams,
      searchQuery: searchParams.get('q'),
      categoryQuery: searchParams.get('query'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      districtIds: searchParams.getAll('district'),
      conditions: searchParams.getAll('condition'),
      rooms: searchParams.getAll('room'),
      dealType: searchParams.get('deal'),
      applyPriceFilter: searchParams.get('applyPriceFilter') === 'true',
    };
  }

  /**
   * Gets all filter options based on search parameters
   */
  static async getOptions(params: FilterParams): Promise<FilterOptions> {
    const {
      categoryParams = [],
      searchQuery = null,
      categoryQuery = null,
      minPrice = null,
      maxPrice = null,
      districtIds = [],
      conditions = [],
      rooms = [],
      dealType = null,
      applyPriceFilter = false
    } = params;

    // Use categoryQuery if available (for category pages search), otherwise use q (for global search)
    const effectiveSearchQuery = categoryQuery || searchQuery;

    // Build base filter for active listings plus search query
    const baseFilterMinimal: any = { status: 'active' };
    if (effectiveSearchQuery && effectiveSearchQuery.trim() !== '') {
      baseFilterMinimal.OR = [
        { title: { contains: effectiveSearchQuery, mode: 'insensitive' } },
        { publicDescription: { contains: effectiveSearchQuery, mode: 'insensitive' } },
      ];
    }

    // Add dealType to base filter if provided
    if (dealType === 'rent') {
      baseFilterMinimal.dealType = 'RENT';
    } else {
      baseFilterMinimal.dealType = 'SALE';
    }

    // Build filter that includes category
    const baseFilter = { ...baseFilterMinimal };

    // Add category filter if provided
    if (categoryParams.length > 0) {
      // For multi-category selection, get all matching categories
      const cats = await prisma.category.findMany({
        where: { slug: { in: categoryParams } },
        select: { id: true }
      });
      if (cats.length > 0) {
        baseFilter.categoryId = { in: cats.map(c => c.id) };
      }
    }

    // Create the price filter separate from other filters to control when it's applied
    const priceFilter: any = {};
    
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      priceFilter.price = { gte: parseFloat(minPrice) };
    }
    
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      if (priceFilter.price) {
        priceFilter.price.lte = parseFloat(maxPrice);
      } else {
        priceFilter.price = { lte: parseFloat(maxPrice) };
      }
    }
    
    // Build the full filter by combining base, price, and other filters
    const fullFilter = {
      ...baseFilter,
      ...(applyPriceFilter ? priceFilter : {}),
      ...(districtIds.length > 0 ? { districtId: { in: districtIds } } : {}),
      ...(conditions.length > 0 ? { condition: { in: conditions } } : {}),
      ...(rooms.length > 0 ? { rooms: { in: rooms.map(r => parseInt(r)).filter(r => !isNaN(r)) } } : {})
    };
    
    // Check if any filters are applied
    const hasFiltersApplied = districtIds.length > 0 || conditions.length > 0 ||
      rooms.length > 0 || 
      (applyPriceFilter && (minPrice !== null || maxPrice !== null));

    // For available options, we want to show what's available with the currently selected filters
    // except for the filter type we're calculating options for

    // Helper function to create filter excluding specific category
    const createFilterExcluding = (excludeFilter: string) => {
      const filter = { ...baseFilter };
      
      // Include price filter if explicitly requested
      if (applyPriceFilter && Object.keys(priceFilter).length > 0) {
        Object.assign(filter, priceFilter);
      }
      
      // Add all filters except the one being excluded
      if (excludeFilter !== 'district' && districtIds.length > 0) {
        filter.districtId = { in: districtIds };
      }
      
      if (excludeFilter !== 'condition' && conditions.length > 0) {
        filter.condition = { in: conditions };
      }
      
      if (excludeFilter !== 'rooms' && rooms.length > 0) {
        const roomValues = rooms.map(r => parseInt(r)).filter(r => !isNaN(r));
        if (roomValues.length > 0) {
          filter.rooms = { in: roomValues };
        }
      }
      
      return filter;
    };
    
    // Run all queries in parallel for better performance
    const [
      // Get total count with all filters applied
      totalWithAllFilters,
      
      // Get price range from active listings
      priceStats,
      
      // Get all available options for each filter type (excluding its own filter)
      districtOptions,
      conditionOptions,
      roomOptions,
      
      // Get categories that match current deal type and other filters
      categoryOptions,
      
      // Count listings for sale and rent (both deal types)
      saleCount,
      rentCount
    ] = await Promise.all([
      // Total count with all filters
      prisma.listing.count({ where: fullFilter }),
      
      // Price range
      prisma.listing.aggregate({
        where: baseFilter, // Only apply base filter for price range
        _min: { price: true },
        _max: { price: true },
      }),
      
      // District options - exclude district filter
      prisma.district.findMany({
        where: {
          listings: {
            some: createFilterExcluding('district')
          }
        },
        include: {
          _count: {
            select: {
              listings: {
                where: createFilterExcluding('district')
              }
            }
          }
        },
        orderBy: { name: 'asc' },
      }),
      
      // Condition options - exclude condition filter
      prisma.listing.groupBy({
        by: ['condition'],
        where: { 
          ...createFilterExcluding('condition'),
          condition: { not: null } 
        },
        _count: { condition: true },
        orderBy: { condition: 'asc' },
      }),
      
      // Room options - exclude room filter
      prisma.listing.groupBy({
        by: ['rooms'],
        where: { 
          ...createFilterExcluding('rooms'),
          rooms: { not: null } 
        },
        _count: { rooms: true },
        orderBy: { rooms: 'asc' },
      }),
      
      // Category options - exclude category filter
      prisma.category.findMany({
        where: {
          listings: {
            some: createFilterExcluding('category')
          }
        },
        include: {
          _count: {
            select: { 
              listings: { 
                where: createFilterExcluding('category')
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      
      // Sale count
      prisma.listing.count({
        where: { 
          ...baseFilterMinimal, 
          dealType: 'SALE',
          // Don't include price filter here
        }
      }),
      
      // Rent count
      prisma.listing.count({
        where: { 
          ...baseFilterMinimal, 
          dealType: 'RENT',
          // Don't include price filter here
        }
      })
    ]);
    
    // Get all available options with counts
    
    // Available options when all filters (including the current one) are applied
    const [
      districtsWithFullFilter,
      conditionsWithFullFilter,
      roomsWithFullFilter,
      categoriesWithFullFilter,
    ] = await Promise.all([
      // Get districts with full filter
      prisma.district.findMany({
        where: {
          listings: {
            some: fullFilter
          }
        },
        select: { id: true }
      }),
      
      // Get conditions with full filter
      prisma.listing.groupBy({
        by: ['condition'],
        where: { 
          ...fullFilter,
          condition: { not: null } 
        },
        _count: { condition: true },
      }),
      
      // Get rooms with full filter
      prisma.listing.groupBy({
        by: ['rooms'],
        where: { 
          ...fullFilter,
          rooms: { not: null } 
        },
        _count: { rooms: true },
      }),
      
      // Get categories with full filter
      prisma.category.findMany({
        where: {
          listings: {
            some: fullFilter
          }
        },
        select: { slug: true }
      })
    ]);
    
    // Create sets for quick lookup
    const districtWithFullFilterSet = new Set(districtsWithFullFilter.map(d => d.id));
    const conditionWithFullFilterSet = new Set(conditionsWithFullFilter.map(c => c.condition));
    const roomWithFullFilterSet = new Set(roomsWithFullFilter.map(r => r.rooms?.toString()));
    const categoryWithFullFilterSet = new Set(categoriesWithFullFilter.map(c => c.slug));
    
    // Determine which deal types to show based on current selection
    const dealTypes = [
      {
        value: 'SALE',
        label: 'Продажа',
        count: saleCount,
        available: true
      },
      {
        value: 'RENT',
        label: 'Аренда',
        count: rentCount,
        available: true
      }
    ];
    
    // Process categories to include availability info
    const processedCategories = categoryOptions.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      count: category._count.listings,
      // A category is available if it appears in the full filter results
      // or if no filters are applied
      available: !hasFiltersApplied || categoryWithFullFilterSet.has(category.slug)
    }));
    
    // Process district options
    const processedDistricts = districtOptions.map(district => ({
      id: district.id,
      name: district.name,
      slug: district.slug,
      count: district._count.listings,
      // A district is available if it appears in the full filter results
      // or if no filters are applied
      available: !hasFiltersApplied || districtWithFullFilterSet.has(district.id)
    }));
    
    // Process condition options
    const processedConditions = conditionOptions.map(condition => ({
      value: condition.condition!,
      count: condition._count.condition,
      // A condition is available if it appears in the full filter results
      // or if no filters are applied
      available: !hasFiltersApplied || conditionWithFullFilterSet.has(condition.condition)
    }));
    
    // Process room options
    const processedRooms = roomOptions.map(room => ({
      value: room.rooms?.toString() || '',
      count: room._count.rooms,
      // A room option is available if it appears in the full filter results
      // or if no filters are applied
      available: !hasFiltersApplied || roomWithFullFilterSet.has(room.rooms?.toString())
    }));
    
    // Return compiled filter options
    return {
      districts: processedDistricts,
      conditions: processedConditions,
      rooms: processedRooms,
      dealTypes,
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 10000000,
        currentMin: minPrice ? parseFloat(minPrice) : null,
        currentMax: maxPrice ? parseFloat(maxPrice) : null
      },
      categories: processedCategories,
      totalCount: totalWithAllFilters,
      hasFiltersApplied
    };
  }
}