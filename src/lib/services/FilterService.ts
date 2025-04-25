import { prisma } from '@/lib/prisma';

export interface FilterParams {
  categoryParams?: string[];
  searchQuery?: string | null;
  categoryQuery?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  districts?: string[];
  conditions?: string[];
  rooms?: string[];
  dealType?: string | null;
  applyPriceFilter?: boolean;
}

export interface FilterOptions {
  districts: Array<{
    value: string;
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
}

export class FilterService {
  /**
   * Parses search parameters from the request
   */
  static parseParams(req: Request): FilterParams {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    return {
      categoryParams: searchParams.getAll('category'),
      searchQuery: searchParams.get('q'),
      categoryQuery: searchParams.get('categoryQuery'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      districts: searchParams.getAll('district'),
      conditions: searchParams.getAll('condition'),
      rooms: searchParams.getAll('rooms'),
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
      districts = [],
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
    } else if (dealType === 'sale') {
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

    // Create the full filter with all current selections 
    // This determines what's currently available
    const fullFilter = { ...baseFilter };
    
    // Add price range filter to full filter
    if (minPrice) {
      fullFilter.price = { ...(fullFilter.price || {}), gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      fullFilter.price = { ...(fullFilter.price || {}), lte: parseFloat(maxPrice) };
    }
    
    // Add district filter to full filter
    if (districts.length > 0) {
      fullFilter.district = { in: districts };
    }
    
    // Add condition filter to full filter
    if (conditions.length > 0) {
      fullFilter.condition = { in: conditions };
    }
    
    // Add room filter to full filter
    if (rooms.length > 0) {
      const roomValues = rooms.map(r => parseInt(r)).filter(r => !isNaN(r));
      if (roomValues.length > 0) {
        fullFilter.rooms = { in: roomValues };
      }
    }

    // Calculate if any filters are applied beyond category/search
    const hasFiltersApplied = districts.length > 0 || conditions.length > 0 || 
                              rooms.length > 0 || minPrice !== null || maxPrice !== null ||
                              dealType !== null;

    // Helper: Build filter for available options, excluding a specific group
    function buildAvailableFilter(exclude: 'district' | 'condition' | 'rooms' | 'dealType') {
      const filter: any = { ...baseFilter };
      // Only include price filters if applyPriceFilter is true
      if (applyPriceFilter && minPrice) filter.price = { ...(filter.price || {}), gte: parseFloat(minPrice) };
      if (applyPriceFilter && maxPrice) filter.price = { ...(filter.price || {}), lte: parseFloat(maxPrice) };
      if (exclude !== 'district' && districts.length > 0) filter.district = { in: districts };
      if (exclude !== 'condition' && conditions.length > 0) filter.condition = { in: conditions };
      if (exclude !== 'rooms' && rooms.length > 0) {
        const roomValues = rooms.map(r => parseInt(r)).filter(r => !isNaN(r));
        if (roomValues.length > 0) filter.rooms = { in: roomValues };
      }
      if (exclude !== 'dealType' && dealType) {
        if (dealType === 'rent') {
          filter.dealType = 'RENT';
        } else {
          filter.dealType = 'SALE';
        }
      }
      return filter;
    }

    // Run all queries in parallel
    const [
      // Count listings for sale and rent
      salesCount,
      rentalsCount,
      // All districts (with counts, ignoring district filter)
      allDistricts,
      // All conditions (with counts, ignoring condition filter)
      allConditions,
      // All rooms (with counts, ignoring rooms filter)
      allRooms,
      // Price range (as before)
      priceRange,
      // Get total matches for full filter
      filteredTotal,
      // Available districts (with all filters except district)
      availableDistricts,
      // Available conditions (with all filters except condition)
      availableConditions,
      // Available rooms (with all filters except rooms)
      availableRooms,
      // Get all categories for filters
      allCategories,
      // Get available categories for graying out
      availableCategories
    ] = await Promise.all([
      prisma.listing.count({
        where: { ...buildAvailableFilter('dealType'), dealType: 'SALE' }
      }),
      prisma.listing.count({
        where: { ...buildAvailableFilter('dealType'), dealType: 'RENT' }
      }),
      prisma.listing.groupBy({
        by: ['district'],
        where: { ...buildAvailableFilter('district'), district: { not: null } },
        _count: { district: true },
        orderBy: { district: 'asc' },
      }),
      prisma.listing.groupBy({
        by: ['condition'],
        where: { ...buildAvailableFilter('condition'), condition: { not: null } },
        _count: { condition: true },
        orderBy: { condition: 'asc' },
      }),
      prisma.listing.groupBy({
        by: ['rooms'],
        where: { ...buildAvailableFilter('rooms'), rooms: { not: null } },
        _count: { rooms: true },
        orderBy: { rooms: 'asc' },
      }),
      prisma.listing.aggregate({
        where: hasFiltersApplied ? { 
          ...fullFilter, 
          price: undefined 
        } : baseFilter,
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.listing.count({
        where: fullFilter
      }),
      prisma.listing.groupBy({
        by: ['district'],
        where: { ...buildAvailableFilter('district'), district: { not: null } },
      }),
      prisma.listing.groupBy({
        by: ['condition'],
        where: { ...buildAvailableFilter('condition'), condition: { not: null } },
      }),
      prisma.listing.groupBy({
        by: ['rooms'],
        where: { ...buildAvailableFilter('rooms'), rooms: { not: null } },
      }),
      !categoryParams.length ? prisma.category.findMany({
        where: {
          listings: {
            some: baseFilterMinimal
          }
        },
        include: {
          _count: {
            select: { listings: { where: baseFilterMinimal } }
          }
        },
        orderBy: { name: 'asc' }
      }) : Promise.resolve([]),
      !categoryParams.length ? prisma.category.findMany({
        where: {
          listings: {
            some: {
              ...(hasFiltersApplied ? fullFilter : baseFilter),
              categoryId: undefined
            }
          }
        },
        select: { slug: true }
      }) : Promise.resolve([])
    ]);

    // Create sets of available values for fast lookups
    const availableDistrictSet = new Set(availableDistricts.map(d => d.district));
    const availableConditionSet = new Set(availableConditions.map(c => c.condition));
    const availableRoomSet = new Set(availableRooms.map(r => r.rooms?.toString()));
    const availableCategorySet = new Set(availableCategories.map(c => c.slug));

    // Process all options and mark availability
    const processedDistricts = allDistricts.map(d => ({
      value: d.district || '',
      count: d._count.district,
      available: hasFiltersApplied ? availableDistrictSet.has(d.district) : true
    }));

    const processedConditions = allConditions.map(c => ({
      value: c.condition || '',
      count: c._count.condition,
      available: hasFiltersApplied ? availableConditionSet.has(c.condition) : true
    }));

    const processedRooms = allRooms.map(r => ({
      value: r.rooms?.toString() || '',
      count: r._count.rooms,
      available: hasFiltersApplied ? availableRoomSet.has(r.rooms?.toString()) : true
    }));

    // Process deal types
    const processedDealTypes = [
      {
        value: 'SALE',
        label: 'Продажа',
        count: salesCount,
        available: true
      },
      {
        value: 'RENT',
        label: 'Аренда',
        count: rentalsCount,
        available: true
      }
    ];

    // Process categories with counts and availability
    const processedCategories = allCategories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      count: c._count.listings,
      available: hasFiltersApplied ? availableCategorySet.has(c.slug) : true
    }));

    return {
      districts: processedDistricts,
      conditions: processedConditions,
      rooms: processedRooms,
      dealTypes: processedDealTypes,
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 10000000,
        currentMin: minPrice ? parseFloat(minPrice) : null,
        currentMax: maxPrice ? parseFloat(maxPrice) : null
      },
      categories: processedCategories,
      totalCount: filteredTotal
    };
  }
} 