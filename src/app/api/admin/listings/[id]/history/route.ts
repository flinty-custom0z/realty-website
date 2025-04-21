import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET listing history
async function getListingHistory(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID in request' }, { status: 400 });
    }
    
    // Fetch listing history with user details
    const history = await prisma.$queryRaw`
      SELECT 
        lh.id, 
        lh."createdAt", 
        lh.action, 
        lh.changes,
        u.name as "userName"
      FROM "ListingHistory" lh
      JOIN "User" u ON lh."userId" = u.id
      WHERE lh."listingId" = ${id}
      ORDER BY lh."createdAt" DESC
    `;
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching listing history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getListingHistory); 