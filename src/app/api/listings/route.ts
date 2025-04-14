import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const searchQuery = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rooms = searchParams.get('rooms');
    const district = searchParams.get('district');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const sortBy = searchParams.get('sortBy') || 'dateAdded';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = { status: 'active' };

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        filter.categoryId = category.id;
      }
    }

    if (searchQuery) {
      filter.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { publicDescription: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (minPrice) {
      filter.price = { ...filter.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      filter.price = { ...filter.price, lte: parseFloat(maxPrice) };
    }

    if (rooms) {
      filter.rooms = parseInt(rooms);
    }

    if (district) {
      filter.district = { contains: district, mode: 'insensitive' };
    }

    // Count total listings with filter
    const total = await prisma.listing.count({ where: filter });

    // Get paginated listings
    const listings = await prisma.listing.findMany({
      where: filter,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        images: {
          where: { isFeatured: true },
          take: 1,
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      listings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}