import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get all filter parameters
    const categorySlug = searchParams.get('category');
    const searchQuery = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const districts = searchParams.getAll('district');
    const conditions = searchParams.getAll('condition');
    const rooms = searchParams.getAll('rooms');
    const categories = searchParams.getAll('category');

    // Build base filter for active listings plus search query
    // For global search, the search query becomes part of the base filter
    const baseFilterMinimal: any = { status: 'active' };
    if (searchQuery && searchQuery.trim() !== '') {
      baseFilterMinimal.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { publicDescription: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Build filter that includes category
    const baseFilter = { ...baseFilterMinimal };

    // Add category filter if provided
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) baseFilter.categoryId = cat.id;
    } else if (categories.length > 0) {
      // For multi-category selection in global search
      const cats = await prisma.category.findMany({
        where: { slug: { in: categories } },
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

    // Run all queries in parallel
    const [
      // Get ALL districts with counts using baseFilterMinimal (search is included)
      allDistricts,
      // Get ALL conditions with counts using baseFilterMinimal
      allConditions,
      // Get ALL rooms with counts using baseFilterMinimal
      allRooms,
      // Get price range using base filter (category + search)
      priceRange,
      // Get total matches for full filter
      filteredTotal,
      // Get available districts with the full filter
      availableDistricts,
      // Get available conditions with the full filter
      availableConditions,
      // Get available rooms with the full filter
      availableRooms
    ] = await Promise.all([
      prisma.listing.groupBy({
      by: ['district'],
        where: { ...baseFilterMinimal, district: { not: null } },
      _count: { district: true },
      orderBy: { district: 'asc' },
      }),
      prisma.listing.groupBy({
      by: ['condition'],
        where: { ...baseFilterMinimal, condition: { not: null } },
      _count: { condition: true },
      orderBy: { condition: 'asc' },
      }),
      prisma.listing.groupBy({
      by: ['rooms'],
        where: { ...baseFilterMinimal, rooms: { not: null } },
      _count: { rooms: true },
      orderBy: { rooms: 'asc' },
      }),
      prisma.listing.aggregate({
        where: baseFilter,
      _min: { price: true },
      _max: { price: true },
      }),
      prisma.listing.count({
        where: fullFilter
      }),
      prisma.listing.groupBy({
        by: ['district'],
        where: { ...fullFilter, district: { not: null } },
      }),
      prisma.listing.groupBy({
        by: ['condition'],
        where: { ...fullFilter, condition: { not: null } },
      }),
      prisma.listing.groupBy({
        by: ['rooms'],
        where: { ...fullFilter, rooms: { not: null } },
      })
    ]);

    // Create sets of available values for fast lookups
    const availableDistrictSet = new Set(availableDistricts.map(d => d.district));
    const availableConditionSet = new Set(availableConditions.map(c => c.condition));
    const availableRoomSet = new Set(availableRooms.map(r => r.rooms?.toString()));

    // Process all options and mark availability
    const processedDistricts = allDistricts.map(d => ({
      value: d.district,
      count: d._count.district,
      available: availableDistrictSet.has(d.district)
    }));

    const processedConditions = allConditions.map(c => ({
      value: c.condition,
      count: c._count.condition,
      available: availableConditionSet.has(c.condition)
    }));

    const processedRooms = allRooms.map(r => ({
      value: r.rooms?.toString(),
      count: r._count.rooms,
      available: availableRoomSet.has(r.rooms?.toString())
    }));

    // Set default values if no results
    const minPriceValue = priceRange._min.price !== null ? priceRange._min.price : 0;
    const maxPriceValue = priceRange._max.price !== null ? priceRange._max.price : 30000000;

    // Calculate if any filters are applied beyond category/search
    const hasFiltersApplied = districts.length > 0 || conditions.length > 0 || 
                              rooms.length > 0 || minPrice !== null || maxPrice !== null;

    // Return the filter options
    return NextResponse.json({
      districts: processedDistricts,
      conditions: processedConditions,
      rooms: processedRooms,
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
      priceRange: { min: 0, max: 30000000 },
      totalCount: 0,
      hasFiltersApplied: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}