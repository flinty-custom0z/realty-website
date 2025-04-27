import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { ListingService } from '@/lib/services/ListingService';
import { ImageService } from '@/lib/services/ImageService';
import { parseListingFormData } from '@/lib/validators/listingValidators';
import { handleValidationError } from '@/lib/validators/errorHandler';

// GET method
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing ID in request' }, { status: 400 });
    }
    
    const listing = await ListingService.getListingById(id);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    return handleValidationError(error);
  }
}

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const formData = await req.formData();
    const listingId = params.id;
    const user = (req as any).user;

    // Use the form data parser to extract and validate listing data
    // This will throw a ZodError if validation fails
    const listingData = parseListingFormData(formData);

    // Update the listing using ListingService
    const updatedListing = await ListingService.updateListing(
      listingId,
      listingData,
      user.id
    );

    // Handle image operations
    const imagesToDelete = JSON.parse(formData.get('imagesToDelete') as string || '[]');
    const featuredImageId = formData.get('featuredImageId') as string;
    
    // Process image deletions if any
    if (imagesToDelete.length > 0) {
      await ListingService.deleteImages(listingId, imagesToDelete, user.id);
    }
    
    // Handle featured image update if provided
    if (featuredImageId) {
      await ListingService.updateFeaturedImage(listingId, featuredImageId, user.id);
    }

    // Handle new image uploads
    const newImageFiles = formData.getAll('newImages');
    if (newImageFiles.length > 0) {
      await ListingService.processImageUploads(
        listingId,
        newImageFiles as File[],
        user.id
      );
    }

    // Get updated listing with all relationships
    const updatedListingWithRelations = await ListingService.getListingByIdWithRelations(listingId);

    return NextResponse.json(updatedListingWithRelations);
  } catch (error) {
    return handleValidationError(error);
  }
});

async function handleDeleteListing(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listingId = params.id;
    const user = (req as any).user;

    if (!listingId) {
      return NextResponse.json({ error: 'Missing ID in request' }, { status: 400 });
    }

    // Delete listing using ListingService
    await ListingService.deleteListing(listingId, user.id);
    
    return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    return handleValidationError(error);
  }
}

export const DELETE = withAuth(handleDeleteListing);