import { NextRequest, NextResponse } from 'next/server';
import { FilterService } from '@/lib/services/FilterService';

export async function GET(req: NextRequest) {
  try {
    // Parse search parameters from the request and get filter options
    const filterParams = FilterService.parseParams(req);
    const data = await FilterService.getOptions(filterParams);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}