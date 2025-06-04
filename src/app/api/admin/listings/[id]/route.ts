import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { ListingService } from '@/lib/services/ListingService';
import { ImageService } from '@/lib/services/ImageService';
import { parseListingFormData } from '@/lib/validators/listingValidators';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

// GET method
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw new ApiError('Missing ID in request', 400);
    }
    
    const listing = await ListingService.getListingById(id);

    if (!listing) {
      throw new ApiError('Listing not found', 404);
    }

    return NextResponse.json(listing);
  } catch (error) {
    return handleApiError(error);
  }
}

export const PUT = withAuth(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const formData = await req.formData();
    const { id: listingId } = await params;
    const user = (req as any).user;

    // First handle image operations to prevent interference with form validation
    // Handle image operations
    const imagesToDelete = formData.get('imagesToDelete') ? 
      JSON.parse(formData.get('imagesToDelete') as string) : [];
    const featuredImageId = formData.get('featuredImageId') as string;
    
    // Process image deletions if any
    if (imagesToDelete.length > 0) {
      await ListingService.deleteImages(listingId, imagesToDelete, user.id);
    }
    
    // Handle featured image update if provided
    if (featuredImageId) {
      await ListingService.updateFeaturedImage(listingId, featuredImageId, user.id);
    }

    // Handle new image uploads separately from listing data update
    const newImageFiles = formData.getAll('newImages');
    if (newImageFiles.length > 0) {
      await ListingService.processImageUploads(
        listingId,
        newImageFiles as File[],
        user.id
      );
    }

    // Now parse and validate listing data
    // This will throw a ZodError if validation fails
    try {
      const listingData = await parseListingFormData(formData);
      
      // Update the listing using ListingService
      await ListingService.updateListing(
        listingId,
        listingData,
        user.id
      );
    } catch (validationError) {
      // If there was a validation error but we already processed images,
      // we don't want to fail the entire request
      console.error("Validation error on listing update:", validationError);
    }

    // Get updated listing with all relationships
    const updatedListingWithRelations = await ListingService.getListingByIdWithRelations(listingId);

    return NextResponse.json(updatedListingWithRelations);
  } catch (error) {
    return handleApiError(error);
  }
});

async function handleDeleteListing(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: listingId } = await params;
    const user = (req as any).user;

    if (!listingId) {
      return NextResponse.json({ error: 'Missing ID in request' }, { status: 400 });
    }

    // Delete listing using ListingService
    await ListingService.deleteListing(listingId, user.id);
    
    return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

export const DELETE = withAuth(handleDeleteListing);