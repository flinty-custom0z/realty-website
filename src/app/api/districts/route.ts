import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/validators/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');

    const whereFilter: any = { status: 'active', district: { not: null } };

    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) whereFilter.categoryId = cat.id;
    }

    const districts = await prisma.listing.groupBy({
      by: ['district'],
      where: whereFilter,
      _count: { district: true },
      orderBy: { district: 'asc' },
    });

    const result = districts.map((d) => d.district).filter(Boolean);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}