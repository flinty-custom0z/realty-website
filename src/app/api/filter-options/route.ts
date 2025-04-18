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

    // Determine which parameters are being actively edited
    // and shouldn't be included in filter queries
    const activeFilter = searchParams.get('activeFilter') || '';

    // Build base filter for active listings
    const baseFilter: any = { status: 'active' };

    // Add category filter if provided
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) baseFilter.categoryId = cat.id;
    } else if (categories.length > 0 && activeFilter !== 'categories') {
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
    if (minPrice && activeFilter !== 'price') {
      baseFilter.price = { ...(baseFilter.price || {}), gte: parseFloat(minPrice) };
    }
    
    if (maxPrice && activeFilter !== 'price') {
      baseFilter.price = { ...(baseFilter.price || {}), lte: parseFloat(maxPrice) };
    }
    
    // Create separate filter objects for each query type
    
    // Filter for district options (exclude district filter if that's what's being edited)
    const districtFilter = { ...baseFilter };
    
    // Filter for condition options (exclude condition filter if that's what's being edited)
    const conditionFilter = { ...baseFilter };
    
    // Filter for room options (exclude room filter if that's what's being edited)
    const roomFilter = { ...baseFilter };
    
    // Filter for price range (exclude price filter if that's what's being edited)
    const priceFilter = { ...baseFilter };
    
    // Add districts filter to other queries
    if (districts.length > 0 && activeFilter !== 'districts') {
      conditionFilter.district = { in: districts };
      roomFilter.district = { in: districts };
      priceFilter.district = { in: districts };
    }
    
    // Add conditions filter to other queries
    if (conditions.length > 0 && activeFilter !== 'conditions') {
      districtFilter.condition = { in: conditions };
      roomFilter.condition = { in: conditions };
      priceFilter.condition = { in: conditions };
    }
    
    // Add rooms filter to other queries
    if (rooms.length > 0 && activeFilter !== 'rooms') {
      const roomValues = rooms.map(r => parseInt(r)).filter(r => !isNaN(r));
      if (roomValues.length > 0) {
        districtFilter.rooms = { in: roomValues };
        conditionFilter.rooms = { in: roomValues };
        priceFilter.rooms = { in: roomValues };
      }
    }

    // Run all queries in parallel for better performance
    const [districtOptions, conditionOptions, roomOptions, priceRange] = await Promise.all([
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

    // Process results and provide defaults
    const minPriceValue = priceRange._min.price !== null ? priceRange._min.price : 0;
    const maxPriceValue = priceRange._max.price !== null ? priceRange._max.price : 30000000;

    // Return filtered options
    return NextResponse.json({
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