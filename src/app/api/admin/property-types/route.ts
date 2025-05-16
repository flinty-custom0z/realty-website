import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

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
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    listings: number;
  };
}

// GET endpoint to fetch all property types (admin only)
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    
    // Create the filter
    const filter: PropertyTypeFilter = {};
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    // Fetch property types with their category information
    const propertyTypes = await prisma.propertyType.findMany({
      where: filter,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            listings: {
              where: {
                status: 'active'
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Format the response to include listing counts
    const result = propertyTypes.map((type) => ({
      ...type,
      count: type._count?.listings || 0,
      _count: undefined
    }));
    
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
});

// POST endpoint to create a new property type (admin only)
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.slug || !data.categoryId) {
      throw new ApiError('Missing required fields', 400);
    }
    
    // Check if the slug is already taken
    const existingPropertyType = await prisma.propertyType.findUnique({
      where: { slug: data.slug }
    });
    
    if (existingPropertyType) {
      throw new ApiError('Slug is already taken', 400);
    }
    
    // Verify the category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    
    if (!category) {
      throw new ApiError('Category not found', 400);
    }
    
    // Create the property type
    const newPropertyType = await prisma.propertyType.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        count: data.count || 0
      }
    });
    
    return NextResponse.json(newPropertyType, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}); 