import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
      const categoriesData = await tx.category.findMany();
      
      // Custom ordering: Квартиры first, then Дома, then others alphabetically
      const categoryOrder = ['apartments', 'houses', 'land', 'commercial', 'new-construction', 'international'];
      
      const orderedCategories = categoriesData.sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.slug);
        const bIndex = categoryOrder.indexOf(b.slug);
        
        // If both categories are in the predefined order, sort by that order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        // If only one is in the predefined order, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // If neither is in the predefined order, sort alphabetically
        return a.name.localeCompare(b.name, 'ru');
      });
      
      // Get listing count for each category
      const categoriesWithCount: Category[] = await Promise.all(
        orderedCategories.map(async (category) => {
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