import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const searchQuery = searchParams.get('q');

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

    // Get available districts
    const districts = await prisma.listing.groupBy({
      by: ['district'],
      where: { ...whereFilter, district: { not: null } },
      _count: { district: true },
      orderBy: { district: 'asc' },
    });

    // Get available conditions
    const conditions = await prisma.listing.groupBy({
      by: ['condition'],
      where: { ...whereFilter, condition: { not: null } },
      _count: { condition: true },
      orderBy: { condition: 'asc' },
    });

    // Get available room counts
    const rooms = await prisma.listing.groupBy({
      by: ['rooms'],
      where: { ...whereFilter, rooms: { not: null } },
      _count: { rooms: true },
      orderBy: { rooms: 'asc' },
    });

    // Get price range
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