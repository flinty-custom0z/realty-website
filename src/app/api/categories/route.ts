import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/validators/errorHandler';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  listingCount?: number;
}

export async function GET(req: NextRequest) {
  try {
    // Get all categories with their listing counts
    const categories = await prisma.$transaction(async (tx) => {
      const categoriesData = await tx.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });
      
      // Get listing count for each category
      const categoriesWithCount: Category[] = await Promise.all(
        categoriesData.map(async (category) => {
          const listingCount = await tx.listing.count({
            where: {
              categoryId: category.id,
              status: 'active',
            },
          });
          
          return {
            ...category,
            listingCount,
          };
        })
      );
      
      return categoriesWithCount;
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}