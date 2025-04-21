import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prismaApi = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlugs = searchParams.getAll('category'); // may be []

    const filter: any = { status: 'active' };

    if (categorySlugs.length) {
      const cats = await prismaApi.category.findMany({ where: { slug: { in: categorySlugs } }, select: { id: true } });
      if (cats.length) filter.categoryId = { in: cats.map((c) => c.id) };
    }

    const q = searchParams.get('q');
    if (q) {
      filter.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { publicDescription: { contains: q, mode: 'insensitive' } },
      ];
    }

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice) filter.price = { ...(filter.price || {}), gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...(filter.price || {}), lte: parseFloat(maxPrice) };

    const districtParams = searchParams.getAll('district');
    if (districtParams.length) filter.district = { in: districtParams };

    const conditionParams = searchParams.getAll('condition');
    if (conditionParams.length) filter.condition = { in: conditionParams };

    const roomsParams = searchParams.getAll('rooms');
    if (roomsParams.length) filter.rooms = { in: roomsParams.map(Number).filter(Boolean) };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    const [total, listings] = await Promise.all([
      prismaApi.listing.count({ where: filter }),
      prismaApi.listing.findMany({
      where: filter,
      include: {
        category: true,
          images: { where: { isFeatured: true }, take: 1 },
      },
        orderBy: { dateAdded: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      }),
    ]);

    return NextResponse.json({ listings, pagination: { total, pages: Math.ceil(total / limit), page, limit } });
  } catch (err) {
    console.error('[api/listings] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}