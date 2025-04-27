import { NextRequest, NextResponse } from 'next/server';
import { parsePaginationParams } from '@/lib/validators/apiValidators';
import { handleValidationError } from '@/lib/validators/errorHandler';
import { ListingService } from '@/lib/services/ListingService';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Validate pagination parameters
    const { page, limit } = parsePaginationParams(searchParams);
    
    // Extract and validate filter parameters
    const categorySlug = searchParams.get('category');
    const priceMin = searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin') as string) : undefined;
    const priceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax') as string) : undefined;
    const district = searchParams.get('district');
    const rooms = searchParams.get('rooms') ? parseInt(searchParams.get('rooms') as string) : undefined;
    const sortBy = searchParams.get('sortBy') || 'dateAdded';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // Build filter for active listings
    const filter: any = { status: 'active' };
    
    // Add category filter if provided
    if (categorySlug) {
      const category = await prisma.category.findUnique({ 
        where: { slug: categorySlug },
        select: { id: true }
      });
      if (category) {
        filter.categoryId = category.id;
      }
    }
    
    // Add price range filter if provided
    if (priceMin !== undefined) {
      filter.price = { ...(filter.price || {}), gte: priceMin };
    }
    if (priceMax !== undefined) {
      filter.price = { ...(filter.price || {}), lte: priceMax };
    }
    
    // Add district filter if provided
    if (district) {
      filter.district = district;
    }
    
    // Add rooms filter if provided
    if (rooms !== undefined) {
      filter.rooms = rooms;
    }
    
    // Get listings with the filter
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: filter,
        include: {
          category: true,
          images: {
            where: { isFeatured: true },
            take: 1
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.listing.count({ where: filter })
    ]);
    
    return NextResponse.json({
      listings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    return handleValidationError(error);
  }
}