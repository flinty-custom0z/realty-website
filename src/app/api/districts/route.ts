
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prismaDistrict = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');

    const whereFilter: any = { status: 'active', district: { not: null } };

    if (categorySlug) {
      const cat = await prismaDistrict.category.findUnique({ where: { slug: categorySlug } });
      if (cat) whereFilter.categoryId = cat.id;
    }

    const districts = await prismaDistrict.listing.groupBy({
      by: ['district'],
      where: whereFilter,
      _count: { district: true },
      orderBy: { district: 'asc' },
    });

    const result = districts.map((d) => d.district).filter(Boolean);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/districts] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}