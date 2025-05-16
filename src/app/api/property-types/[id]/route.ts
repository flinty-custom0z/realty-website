import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
      }
    });

    if (!propertyType) {
      throw new ApiError('Property type not found', 404);
    }

    // Format the response
    const result = {
      ...propertyType,
      count: propertyType._count?.listings || 0,
      _count: undefined
    };

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
} 