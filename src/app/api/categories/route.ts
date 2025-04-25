import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prevent hot-reloading from creating multiple instances
const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { 
            listings: { 
              where: { status: 'active' } 
            },
          },
        },
        // Get listings for counting by deal type
        listings: {
          where: { 
            status: 'active',
          },
          select: {
            dealType: true,
          }
        }
      },
    });
    
    // Add calculated counts for each deal type
    const categoriesWithCounts = categories.map(category => {
      const saleCount = category.listings.filter(l => l.dealType === 'SALE').length;
      const rentCount = category.listings.filter(l => l.dealType === 'RENT').length;
      
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        _count: category._count,
        saleCount,
        rentCount,
      };
    });
    
    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}