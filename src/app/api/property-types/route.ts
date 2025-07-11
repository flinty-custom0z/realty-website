import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/validators/errorHandler';

interface PropertyTypeWithCount {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  count: number;
  category: {
    name: string;
    slug: string;
  };
}

interface PropertyTypeFilter {
  categoryId?: string;
}

// Define PropertyTypeModel interface for the prisma result
interface PropertyTypeModel {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  count?: number;
  category: {
    name: string;
    slug: string;
  };
  _count: {
    listings: number;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const includeCount = searchParams.get('includeCount') === 'true';
    
    const filter: PropertyTypeFilter = {};
    
    // Apply category filter if provided
    if (categoryId) {
      filter.categoryId = categoryId;
    } else if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true }
      });
      
      if (category) {
        filter.categoryId = category.id;
      }
    }
    
    // Get property types
    const propertyTypes = await prisma.propertyType.findMany({
      where: filter,
      include: {
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        ...(includeCount ? {
          _count: {
            select: {
              listings: {
                where: {
                  status: 'active'
                }
              }
            }
          }
        } : {})
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // If count is needed, transform the results
    if (includeCount) {
      const result = propertyTypes.map((type: any): PropertyTypeWithCount => ({
        id: type.id,
        name: type.name,
        slug: type.slug,
        categoryId: type.categoryId,
        count: type._count ? type._count.listings : 0,
        category: type.category
      }));
      
      return NextResponse.json(result);
    }
    
    // Otherwise return as is
    return NextResponse.json(propertyTypes);
  } catch (error) {
    return handleApiError(error);
  }
} 