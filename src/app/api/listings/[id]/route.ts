import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/env';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to get the real value
    const { id } = await params;

    if (!id) {
      throw new ApiError('Missing listing ID', 400);
    }

    // Check if user is admin (to show admin comments)
    const isAdmin = await checkIfUserIsAdmin();

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true, phone: true, photo: true, createdAt: true } },
        images: true,
      },
    });

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    // If user is not admin, strip out adminComment
    if (!isAdmin) {
      const { adminComment, ...publicData } = listing;
      return NextResponse.json(publicData);
    }

    // Admin sees everything
    return NextResponse.json(listing);
  } catch (error) {
    return handleApiError(error);
  }
}


async function checkIfUserIsAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return false;
    
    const { id } = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id } });
    
    return !!user;
  } catch {
    return false;
  }
}
