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
    
    // Process image paths for deleted images to ensure they're complete
    const processedHistory = (history as any[]).map(entry => {
      if (entry.action === 'images' && entry.changes.deleted) {
        // Make sure image paths are properly formatted for frontend rendering
        entry.changes.deleted = entry.changes.deleted.map((img: any) => {
          if (img.path && !img.path.startsWith('http') && !img.path.startsWith('/')) {
            return { ...img, path: `/${img.path}` };
          }
          return img;
        });
      }
      return entry;
    });
    
    return NextResponse.json(processedHistory);
  } catch (error) {
    console.error('Error fetching listing history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getListingHistory); 