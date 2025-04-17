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
    }

    // Add search filter if provided
    if (searchQuery && searchQuery.trim() !== '') {
      whereFilter.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { publicDescription: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Handle additional filter parameters to provide dynamic filter options
    
    // Price range filter
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice) {
      whereFilter.price = { ...(whereFilter.price || {}), gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      whereFilter.price = { ...(whereFilter.price || {}), lte: parseFloat(maxPrice) };
    }
    
    // Handle array params (district, condition, rooms)
    const makeArrayFilter = (paramName: string, fieldName: string) => {
      const params = searchParams.getAll(paramName);
      if (params.length > 0) {
        // Skip filtering by the parameter we're looking for options of
        if (paramName !== fieldName) {
          whereFilter[paramName] = { in: params };
        }
      }
    };
    
    // Get districts with selected condition/rooms filters applied
    const districtFilter = { ...whereFilter };
    delete districtFilter.district; // Remove district filter when getting district options
    const districts = await prisma.listing.groupBy({
      by: ['district'],
      where: { ...districtFilter, district: { not: null } },
      _count: { district: true },
      orderBy: { district: 'asc' },
    });

    // Get conditions with selected district/rooms filters applied
    const conditionFilter = { ...whereFilter };
    delete conditionFilter.condition; // Remove condition filter when getting condition options
    const conditions = await prisma.listing.groupBy({
      by: ['condition'],
      where: { ...conditionFilter, condition: { not: null } },
      _count: { condition: true },
      orderBy: { condition: 'asc' },
    });

    // Get room counts with selected district/condition filters applied
    const roomsFilter = { ...whereFilter };
    delete roomsFilter.rooms; // Remove rooms filter when getting room options
    const rooms = await prisma.listing.groupBy({
      by: ['rooms'],
      where: { ...roomsFilter, rooms: { not: null } },
      _count: { rooms: true },
      orderBy: { rooms: 'asc' },
    });

    // Get price range based on current filters
    const priceRange = await prisma.listing.aggregate({
      where: whereFilter,
      _min: { price: true },
      _max: { price: true },
    });

    return NextResponse.json({
      districts: districts.map(d => d.district).filter(Boolean),
      conditions: conditions.map(c => c.condition).filter(Boolean),
      rooms: rooms.map(r => r.rooms?.toString()).filter(Boolean),
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 30000000
      }
    });
  } catch (err) {
    console.error('[api/filter-options] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}