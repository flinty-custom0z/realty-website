import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/validators/errorHandler';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

// Function to transliterate Cyrillic to Latin characters
function transliterate(text: string): string {
  return text.toLowerCase()
    // Replace Cyrillic characters with Latin equivalents
    .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g')
    .replace(/д/g, 'd').replace(/е/g, 'e').replace(/ё/g, 'yo').replace(/ж/g, 'zh')
    .replace(/з/g, 'z').replace(/и/g, 'i').replace(/й/g, 'y').replace(/к/g, 'k')
    .replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o')
    .replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't')
    .replace(/у/g, 'u').replace(/ф/g, 'f').replace(/х/g, 'kh').replace(/ц/g, 'ts')
    .replace(/ч/g, 'ch').replace(/ш/g, 'sh').replace(/щ/g, 'sch').replace(/ъ/g, '')
    .replace(/ы/g, 'y').replace(/ь/g, '').replace(/э/g, 'e').replace(/ю/g, 'yu')
    .replace(/я/g, 'ya')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove any remaining non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9\-]+/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

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
    let slug = transliterate(name);
    
    // If slug is empty (e.g., for names with only special characters), use a fallback
    if (!slug) {
      slug = `district-${Date.now()}`;
    }
    
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
      // If it's the same name, return the existing district
      if (existing.name.toLowerCase() === name.toLowerCase()) {
        return NextResponse.json(
          { error: 'District already exists', district: existing },
          { status: 409 }
        );
      }
      
      // If it's just a slug conflict, generate a unique slug
      let counter = 1;
      let uniqueSlug = `${slug}-${counter}`;
      
      while (await prisma.district.findUnique({ where: { slug: uniqueSlug } })) {
        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
      
      slug = uniqueSlug;
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