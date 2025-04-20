import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    if (!q || q.trim().length < 2) {
      // Require at least 2 characters for suggestions
      return NextResponse.json({ suggestions: [] });
    }

    // Find up to 10 listings with titles or addresses matching the query
    const suggestions = await prisma.listing.findMany({
      where: {
        status: 'active',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        address: true,
      },
      orderBy: { dateAdded: 'desc' },
      take: 10,
    });

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('[api/listings/suggestions] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 