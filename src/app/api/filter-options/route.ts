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

    // Build base filter for active listings
    const baseFilter: any = { status: 'active' };

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

    // Add search filter if provided
    if (searchQuery && searchQuery.trim() !== '') {
      baseFilter.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { publicDescription: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Add price range filter
    if (minPrice) {
      baseFilter.price = { ...(baseFilter.price || {}), gte: parseFloat(minPrice) };
    }
    
    if (maxPrice) {
      baseFilter.price = { ...(baseFilter.price || {}), lte: parseFloat(maxPrice) };
    }
    
    // Create different filter objects for each query type
    const districtFilter = { ...baseFilter };
    const conditionFilter = { ...baseFilter };
    const roomFilter = { ...baseFilter };
    const priceFilter = { ...baseFilter };
    
    // Add district filter to condition, room, and price queries
    if (districts.length > 0) {
      conditionFilter.district = { in: districts };
      roomFilter.district = { in: districts };
      priceFilter.district = { in: districts };
    }
    
    // Add condition filter to district, room, and price queries  
    if (conditions.length > 0) {
      districtFilter.condition = { in: conditions };
      roomFilter.condition = { in: conditions };
      priceFilter.condition = { in: conditions };
    }
    
    // Add room filter to district, condition, and price queries
    if (rooms.length > 0) {
      const roomValues = rooms.map(r => parseInt(r)).filter(r => !isNaN(r));
      if (roomValues.length > 0) {
        districtFilter.rooms = { in: roomValues };
        conditionFilter.rooms = { in: roomValues };
        priceFilter.rooms = { in: roomValues };
      }
    }

    // Run all queries in parallel
    const [allListings, districtOptions, conditionOptions, roomOptions, priceRange] = await Promise.all([
      // Get all listings that match the base filter for counting
      prisma.listing.findMany({
        where: baseFilter,
        select: { id: true }
      }),
      
      // Get available districts based on current filters
      prisma.listing.groupBy({
      by: ['district'],
      where: { ...districtFilter, district: { not: null } },
      _count: { district: true },
      orderBy: { district: 'asc' },
      }),

      // Get available conditions based on current filters
      prisma.listing.groupBy({
      by: ['condition'],
      where: { ...conditionFilter, condition: { not: null } },
      _count: { condition: true },
      orderBy: { condition: 'asc' },
      }),

      // Get available room counts based on current filters
      prisma.listing.groupBy({
      by: ['rooms'],
        where: { ...roomFilter, rooms: { not: null } },
      _count: { rooms: true },
      orderBy: { rooms: 'asc' },
      }),

      // Get price range based on current filters
      prisma.listing.aggregate({
        where: priceFilter,
      _min: { price: true },
      _max: { price: true },
      })
    ]);

    // Set default values if no results
    const minPriceValue = priceRange._min.price !== null ? priceRange._min.price : 0;
    const maxPriceValue = priceRange._max.price !== null ? priceRange._max.price : 30000000;

    // Return the filter options
    return NextResponse.json({
      totalCount: allListings.length,
      districts: districtOptions.map(d => d.district).filter(Boolean),
      conditions: conditionOptions.map(c => c.condition).filter(Boolean),
      rooms: roomOptions.map(r => r.rooms?.toString()).filter(Boolean),
      priceRange: {
        min: minPriceValue,
        max: maxPriceValue
      }
    });
  } catch (err) {
    console.error('[api/filter-options] error', err);
    return NextResponse.json({ 
      districts: [],
      conditions: [],
      rooms: [],
      priceRange: { min: 0, max: 30000000 },
      error: 'Internal server error'
    }, { status: 500 });
  }
}