import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';
import { FilterService } from '@/lib/services/FilterService';
import { OptimizedListingService } from '@/lib/services/OptimizedListingService';

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

    // Get filtered listings with pagination - using optimized service with caching
    const result = await OptimizedListingService.getListingsOptimized({
      page,
      limit,
      sort,
      order: order as 'asc' | 'desc',
      // Convert null to undefined for TypeScript compatibility
      dealType: restParams.dealType || undefined,
      searchQuery: restParams.searchQuery || undefined,
      categorySlug: restParams.categoryParams?.[0] || undefined,
      priceMin: restParams.minPrice ? parseFloat(restParams.minPrice) : undefined,
      priceMax: restParams.maxPrice ? parseFloat(restParams.maxPrice) : undefined,
      districts: districtIds,
      conditions: restParams.conditions,
      cityIds: restParams.cityIds,
      propertyTypeIds: restParams.propertyTypeIds,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}