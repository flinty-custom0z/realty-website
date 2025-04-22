import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if user is admin (to show admin comments)
    const isAdmin = await checkIfUserIsAdmin();

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        user: { select: { id: true, name: true, phone: true, photo: true } },
        images: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // If user is not admin, remove adminComment field
    if (!isAdmin) {
      const { adminComment, ...rest } = listing;
      return NextResponse.json(rest);
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkIfUserIsAdmin() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return false;
    
    const { id } = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id } });
    
    return !!user;
  } catch {
    return false;
  }
}
