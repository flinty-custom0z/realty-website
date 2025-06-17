import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';
import { FilterService } from '@/lib/services/FilterService';
import { ListingService } from '@/lib/services/ListingService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || 'dateAdded';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Parse filter parameters
    const filterParams = FilterService.parseParams(req);

    // Map districtIds from filterParams to the property expected by ListingService
    const { districtIds, ...restParams } = filterParams;

    // Get filtered listings with pagination
    const result = await ListingService.getFilteredListings({
      ...restParams,
      districts: districtIds,
      page,
      limit,
      sort,
      order: order as 'asc' | 'desc'
    });
    
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}