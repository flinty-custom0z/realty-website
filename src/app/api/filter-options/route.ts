import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get all filter parameters - using getAll consistently for categories
    const categoryParams = searchParams.getAll('category');
    const searchQuery = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const districts = searchParams.getAll('district');
    const conditions = searchParams.getAll('condition');
    const rooms = searchParams.getAll('rooms');
    const dealType = searchParams.get('dealType');

    // Read flag from frontend: only apply price filter for available options if user has edited price
    const applyPriceFilter = searchParams.get('applyPriceFilter') === 'true';

    // Build base filter for active listings plus search query
    const baseFilterMinimal: any = { status: 'active' };
    if (searchQuery && searchQuery.trim() !== '') {
      baseFilterMinimal.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { publicDescription: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Add dealType to base filter if provided
    if (dealType === 'SALE' || dealType === 'RENT') {
      baseFilterMinimal.dealType = dealType;
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
        filter.dealType = dealType;
      }
      return filter;
    }

    // Count listings for sale and rent
    const [salesCount, rentalsCount] = await Promise.all([
      prisma.listing.count({
        where: { ...buildAvailableFilter('dealType'), dealType: 'SALE' }
      }),
      prisma.listing.count({
        where: { ...buildAvailableFilter('dealType'), dealType: 'RENT' }
      })
    ]);

    // Run all queries in parallel
    const [
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
      !categoryParams ? prisma.category.findMany({
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
      !categoryParams ? prisma.category.findMany({
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
      value: d.district,
      count: d._count.district,
      available: hasFiltersApplied ? availableDistrictSet.has(d.district) : true // CHANGED: Always available if no filters
    }));

    const processedConditions = allConditions.map(c => ({
      value: c.condition,
      count: c._count.condition,
      available: hasFiltersApplied ? availableConditionSet.has(c.condition) : true // CHANGED: Always available if no filters
    }));

    const processedRooms = allRooms.map(r => ({
      value: r.rooms?.toString(),
      count: r._count.rooms,
      available: hasFiltersApplied ? availableRoomSet.has(r.rooms?.toString()) : true // CHANGED: Always available if no filters
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

    // Process categories with availability
    const processedCategories = !categoryParams ? allCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat._count.listings,
      available: hasFiltersApplied ? availableCategorySet.has(cat.slug) : true // CHANGED: Always available if no filters
    })) : [];

    // Set default values if no results
    const minPriceValue = priceRange._min.price !== null ? priceRange._min.price : 0;
    const maxPriceValue = priceRange._max.price !== null ? priceRange._max.price : 30000000;

    // Return the filter options
    return NextResponse.json({
      districts: processedDistricts,
      conditions: processedConditions,
      rooms: processedRooms,
      categories: processedCategories,
      dealTypes: processedDealTypes,
      priceRange: {
        min: minPriceValue,
        max: maxPriceValue
      },
      totalCount: filteredTotal,
      hasFiltersApplied
    });
  } catch (err) {
    console.error('[api/filter-options] error', err);
    return NextResponse.json({ 
      districts: [],
      conditions: [],
      rooms: [],
      categories: [],
      dealTypes: [
        { value: 'SALE', label: 'Продажа', count: 0, available: true },
        { value: 'RENT', label: 'Аренда', count: 0, available: true }
      ],
      priceRange: { min: 0, max: 30000000 },
      totalCount: 0,
      hasFiltersApplied: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}