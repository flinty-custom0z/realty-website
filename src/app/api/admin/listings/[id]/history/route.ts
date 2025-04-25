import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { HistoryService } from '@/lib/services/HistoryService';

// GET listing history
async function getListingHistory(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID in request' }, { status: 400 });
    }
    
    // Use HistoryService to get detailed timeline with processed image information
    const processedHistory = await HistoryService.getHistoryTimeline(id);
    
    return NextResponse.json(processedHistory);
  } catch (error) {
    console.error('Error fetching listing history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getListingHistory); 