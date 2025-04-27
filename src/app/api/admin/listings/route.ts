import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { ListingService } from '@/lib/services/ListingService';
import { ImageService } from '@/lib/services/ImageService';
import { parseListingFormData } from '@/lib/validators/listingValidators';
import { handleApiError } from '@/lib/validators/errorHandler';
import prisma from '@/lib/prisma';
import { createLogger } from '@/lib/logging';

// Create a logger instance
const logger = createLogger('AdminListingsAPI');

async function handleCreateListing(req: NextRequest) {
  try {
    const formData = await req.formData();
    const user = (req as any).user;
    
    logger.info("Creating new listing for user:", user.name);
    
    // Use the form data parser to extract and validate listing data
    // This will throw a ZodError if validation fails
    const listingData = await parseListingFormData(formData);
    
    logger.info("Extracted and validated form data:", {
      title: listingData.title,
      categoryId: listingData.categoryId,
      price: listingData.price,
      dealType: listingData.dealType
    });
    
    // Create listing using ListingService
    logger.info("Creating listing in database");
    const newListing = await ListingService.createListing(listingData, user.id);

    logger.info("Listing created with ID:", newListing.id);

    // Handle image uploads
    const images = formData.getAll('images');
    logger.info(`Processing ${images.length} images`);
    
    if (images.length > 0) {
      // Process image uploads using ListingService
      await ListingService.processImageUploads(
        newListing.id,
        images as File[],
        user.id
      );
    } else {
      // If no images were uploaded, use a placeholder
      logger.info("No images uploaded, using placeholder");
      const category = await prisma.category.findUnique({ where: { id: listingData.categoryId } });
      let placeholderPath = `/images/${category?.slug || 'placeholder'}_placeholder.png`;
      
      await ImageService.createImageRecord(newListing.id, placeholderPath, true);
    }

    logger.info("Listing creation complete, returning response");
    return NextResponse.json(newListing, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    // Use the validation error handler
    return handleApiError(err);
  }
}

export const POST = withAuth(handleCreateListing);

// Get all listings (for admin)
async function handleGetAllListings(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const categoryFilter = searchParams.get('category');
    const statusFilter = searchParams.get('status');

    // Use ListingService to get filtered listings
    const result = await ListingService.getAllListings({
      page,
      limit,
      categorySlug: categoryFilter,
      status: statusFilter
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(handleGetAllListings);