import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get all unique districts from active listings
    const districts = await prisma.listing.findMany({
      where: {
        status: 'active',
        district: {
          not: null,
        }
      },
      select: {
        district: true,
      },
      distinct: ['district'],
      orderBy: {
        district: 'asc',
      },
    });

    // Extract and filter out null/empty districts
    const uniqueDistricts = districts
      .map(item => item.district)
      .filter(Boolean) as string[];

    return NextResponse.json(uniqueDistricts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}