import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/validators/errorHandler';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');

    // Fetch all districts from the District model
    let districts = await prisma.district.findMany({
      orderBy: { name: 'asc' },
    });

    // If category filter is provided, filter districts that have listings in that category
    if (categorySlug) {
      const category = await prisma.category.findUnique({ 
        where: { slug: categorySlug } 
      });
      
      if (category) {
        // Find districts that have listings in this category
        const listingsWithDistricts = await prisma.listing.findMany({
          where: { 
            categoryId: category.id,
            status: 'active',
            districtId: { not: null }
          },
          select: { districtId: true },
          distinct: ['districtId']
        });
        
        const districtIds = listingsWithDistricts.map(l => l.districtId).filter(Boolean) as string[];
        
        // Only keep districts that have listings in this category
        if (districtIds.length > 0) {
          districts = districts.filter(d => districtIds.includes(d.id));
        }
      }
    }
    
    return NextResponse.json(districts);
  } catch (error) {
    return handleApiError(error);
  }
}

// Schema for district creation
const districtSchema = z.object({
  name: z.string().min(1, "District name is required"),
});

// Handle district creation (protected by auth)
async function handleCreateDistrict(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const validation = districtSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { name } = validation.data;
    
    // Create slug from name
    const slug = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    // Check if district with this name already exists
    const existing = await prisma.district.findFirst({
      where: { 
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug: slug }
        ]
      }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'District already exists', district: existing },
        { status: 409 }
      );
    }
    
    // Create new district
    const district = await prisma.district.create({
      data: {
        name,
        slug,
      }
    });
    
    return NextResponse.json(district, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Export POST method with auth protection
export const POST = withAuth(handleCreateDistrict);