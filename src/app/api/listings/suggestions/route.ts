import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const listingId = searchParams.get('listingId');
    const categoryId = searchParams.get('categoryId');
    const limit = Number(searchParams.get('limit') || '4');
    
    // Search by query string for suggestions
    if (q && q.trim().length >= 2) {
      const suggestions = await prisma.listing.findMany({
        where: {
          status: 'active',
          OR: [
            { propertyType: { name: { contains: q, mode: 'insensitive' } } },
            { address: { contains: q, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          address: true,
          propertyType: {
            select: {
              name: true
            }
          }
        },
        take: limit,
        orderBy: { dateAdded: 'desc' }
      });
      
      // Format the response
      const formattedSuggestions = suggestions.map(suggestion => ({
        id: suggestion.id,
        address: suggestion.address,
        propertyTypeName: suggestion.propertyType.name
      }));
      
      return NextResponse.json({ suggestions: formattedSuggestions });
    }
    
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
          category: true,
          propertyType: true
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
        category: true,
        propertyType: true
      },
      take: limit,
      orderBy: { dateAdded: 'desc' }
    });
    
    return NextResponse.json(suggestions);
  } catch (error) {
    return handleApiError(error);
  }
} 