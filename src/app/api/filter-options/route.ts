import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const searchQuery = searchParams.get('q');

    // Build base filter for active listings
    const whereFilter: any = { status: 'active' };

    // Add category filter if provided
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) whereFilter.categoryId = cat.id;
    } else {
      // For multi-category selection in global search
      const categoryParams = searchParams.getAll('category');
      if (categoryParams.length > 0) {
        const categories = await prisma.category.findMany({
          where: { slug: { in: categoryParams } },
          select: { id: true }
        });
        
        if (categories.length > 0) {
          whereFilter.categoryId = { in: categories.map(c => c.id) };
        }
      }
    }

    // Add search filter if provided
    if (searchQuery && searchQuery.trim() !== '') {
      whereFilter.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { publicDescription: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Create filters specific to each field type by cloning and removing
    // the field we're querying for from each
    
    // Filter for district options (remove district filter)
    const districtFilter = { ...whereFilter };
    
    // Filter for condition options (remove condition filter)
    const conditionFilter = { ...whereFilter };
    
    // Filter for room options (remove room filter)
    const roomFilter = { ...whereFilter };
    
    // Add district filter (when querying for conditions and rooms)
    const districtParams = searchParams.getAll('district');
    if (districtParams.length > 0) {
      conditionFilter.district = { in: districtParams };
      roomFilter.district = { in: districtParams };
      // Don't add to districtFilter since we're querying for districts
    }
    
    // Add condition filter (when querying for districts and rooms)
    const conditionParams = searchParams.getAll('condition');
    if (conditionParams.length > 0) {
      districtFilter.condition = { in: conditionParams };
      roomFilter.condition = { in: conditionParams };
      // Don't add to conditionFilter since we're querying for conditions
    }
    
    // Add room filter (when querying for districts and conditions)
    const roomParams = searchParams.getAll('rooms');
    if (roomParams.length > 0) {
      const roomValues = roomParams.map(r => parseInt(r)).filter(r => !isNaN(r));
      if (roomValues.length > 0) {
        districtFilter.rooms = { in: roomValues };
        conditionFilter.rooms = { in: roomValues };
        // Don't add to roomFilter since we're querying for rooms
      }
    }
    
    // Add price range filter to all
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    if (minPrice) {
      const priceFilter = { gte: parseFloat(minPrice) };
      districtFilter.price = { ...districtFilter.price, ...priceFilter };
      conditionFilter.price = { ...conditionFilter.price, ...priceFilter };
      roomFilter.price = { ...roomFilter.price, ...priceFilter };
      whereFilter.price = { ...whereFilter.price, ...priceFilter };
    }
    
    if (maxPrice) {
      const priceFilter = { lte: parseFloat(maxPrice) };
      districtFilter.price = { ...districtFilter.price, ...priceFilter };
      conditionFilter.price = { ...conditionFilter.price, ...priceFilter };
      roomFilter.price = { ...roomFilter.price, ...priceFilter };
      whereFilter.price = { ...whereFilter.price, ...priceFilter };
    }

    // Run queries in parallel to improve performance
    const [districts, conditions, rooms, priceRange] = await Promise.all([
    // Get districts with selected condition/rooms filters applied
      prisma.listing.groupBy({
      by: ['district'],
      where: { ...districtFilter, district: { not: null } },
      _count: { district: true },
      orderBy: { district: 'asc' },
      }),

    // Get conditions with selected district/rooms filters applied
      prisma.listing.groupBy({
      by: ['condition'],
      where: { ...conditionFilter, condition: { not: null } },
      _count: { condition: true },
      orderBy: { condition: 'asc' },
      }),

    // Get room counts with selected district/condition filters applied
      prisma.listing.groupBy({
      by: ['rooms'],
        where: { ...roomFilter, rooms: { not: null } },
      _count: { rooms: true },
      orderBy: { rooms: 'asc' },
      }),

      // Get price range based on all current filters
      prisma.listing.aggregate({
      where: whereFilter,
      _min: { price: true },
      _max: { price: true },
      })
    ]);

    // Provide fallback values if no results
    const minPriceValue = priceRange._min.price !== null ? priceRange._min.price : 0;
    const maxPriceValue = priceRange._max.price !== null ? priceRange._max.price : 30000000;

    return NextResponse.json({
      districts: districts.map(d => d.district).filter(Boolean),
      conditions: conditions.map(c => c.condition).filter(Boolean),
      rooms: rooms.map(r => r.rooms?.toString()).filter(Boolean),
      priceRange: {
        min: minPriceValue,
        max: maxPriceValue
      }
    });
  } catch (err) {
    console.error('[api/filter-options] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}