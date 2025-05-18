import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

// GET endpoint to fetch a specific property type
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      throw new ApiError('Missing property type ID', 400);
    }
    
    const propertyType = await prisma.propertyType.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    if (!propertyType) {
      throw new ApiError('Property type not found', 404);
    }
    
    return NextResponse.json(propertyType);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT endpoint to update a property type (admin only)
export const PUT = withAuth(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.slug || !data.categoryId) {
      throw new ApiError('Missing required fields', 400);
    }
    
    // Check if the slug is already taken (but not by this property type)
    const existingPropertyType = await prisma.propertyType.findFirst({
      where: {
        slug: data.slug,
        id: { not: id }
      }
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
    
    // Update the property type
    const updatedPropertyType = await prisma.propertyType.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId
      }
    });
    
    return NextResponse.json(updatedPropertyType);
  } catch (error) {
    return handleApiError(error);
  }
});

// DELETE endpoint to delete a property type (admin only)
export const DELETE = withAuth(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    
    // Check if there are any listings using this property type
    const listingsCount = await prisma.listing.count({
      where: { typeId: id }
    });
    
    if (listingsCount > 0) {
      throw new ApiError('Cannot delete a property type that is in use', 400);
    }
    
    // Delete the property type
    await prisma.propertyType.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}); 