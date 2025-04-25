import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { ListingService } from '@/lib/services/ListingService';
import { ImageService } from '@/lib/services/ImageService';
import { parseListingFormData } from '@/lib/validators/listingValidators';
import prisma from '@/lib/prisma';

async function handleCreateListing(req: NextRequest) {
  try {
    const formData = await req.formData();
    const user = (req as any).user;
    
    console.log("Creating new listing for user:", user.name);
    
    // Use the form data parser to extract and validate listing data
    const listingData = parseListingFormData(formData);
    
    console.log("Extracted form data:", {
      title: listingData.title,
      categoryId: listingData.categoryId,
      price: listingData.price
    });
    
    // Create listing using ListingService
    console.log("Creating listing in database");
    const newListing = await ListingService.createListing(listingData, user.id);

    console.log("Listing created with ID:", newListing.id);

    // Handle image uploads
    const images = formData.getAll('images');
    console.log(`Processing ${images.length} images`);
    
    if (images.length > 0) {
      // Process image uploads using ListingService
      await ListingService.processImageUploads(
        newListing.id,
        images as File[],
        user.id
      );
    } else {
      // If no images were uploaded, use a placeholder
      console.log("No images uploaded, using placeholder");
      const category = await prisma.category.findUnique({ where: { id: listingData.categoryId } });
      let placeholderPath = `/images/${category?.slug || 'placeholder'}_placeholder.png`;
      
      await ImageService.createImageRecord(newListing.id, placeholderPath, true);
    }

    console.log("Listing creation complete, returning response");
    return NextResponse.json(newListing, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error("Error creating listing:", err);
    return NextResponse.json({ 
      error: 'Error creating listing', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
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
    console.error("Error fetching listings:", error);
    return NextResponse.json({ 
      error: 'Error fetching listings',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export const GET = withAuth(handleGetAllListings);