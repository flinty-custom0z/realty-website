import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    const categoryId = searchParams.get('categoryId');
    const limit = Number(searchParams.get('limit') || '4');
    
    if (!listingId && !categoryId) {
      throw new ApiError('Either listingId or categoryId is required', 400);
    }
    
    // If listingId provided, get similar listings from same category
    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { categoryId: true }
      });
      
      if (!listing) {
        throw new ApiError('Listing not found', 404);
      }
      
      const suggestions = await prisma.listing.findMany({
        where: {
          categoryId: listing.categoryId,
          id: { not: listingId },
          status: 'active'
        },
        include: {
          images: {
            where: { isFeatured: true },
            take: 1
          },
          category: true
        },
        take: limit,
        orderBy: { dateAdded: 'desc' }
      });
      
      return NextResponse.json(suggestions);
    }
    
    // If only categoryId provided, get latest listings from that category
    const suggestions = await prisma.listing.findMany({
      where: {
        categoryId: categoryId as string,
        status: 'active'
      },
      include: {
        images: {
          where: { isFeatured: true },
          take: 1
        },
        category: true
      },
      take: limit,
      orderBy: { dateAdded: 'desc' }
    });
    
    return NextResponse.json(suggestions);
  } catch (error) {
    return handleApiError(error);
  }
} 