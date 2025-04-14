import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        images: true,
        comments: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if user is authenticated (to include comments)
    const user = await verifyAuth(req);
    if (!user) {
      // Remove comments for non-admin users
      delete listing.comments;
    }

    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}