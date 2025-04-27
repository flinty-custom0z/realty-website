import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { HistoryService } from '@/lib/services/HistoryService';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

// GET listing history
async function getListingHistory(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      throw new ApiError('Missing ID in request', 400);
    }
    
    // Use HistoryService to get detailed timeline with processed image information
    const processedHistory = await HistoryService.getHistoryTimeline(id);
    
    return NextResponse.json(processedHistory);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(getListingHistory); 