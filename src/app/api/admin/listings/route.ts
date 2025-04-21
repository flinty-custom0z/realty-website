import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function ensureDirectoryExists(dirPath: string) {
  try {
    await access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

async function saveImage(file: File) {
  try {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filename = `${uuidv4()}.${ext}`;

    // Ensure images directory exists
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    await ensureDirectoryExists(imagesDir);

    const filePath = path.join(imagesDir, filename);
    console.log(`Saving image to: ${filePath}`);

    await writeFile(filePath, buffer);
  return `/images/${filename}`;
  } catch (error) {
    console.error("Error saving image:", error);
    throw new Error(`Failed to save image: ${error}`);
  }
}

async function handleCreateListing(req: NextRequest) {
  try {
    const formData = await req.formData();
    const user = (req as any).user;
    
    console.log("Creating new listing for user:", user.name);
    
    // Extract listing data
    const title = formData.get('title') as string;
    const publicDescription = formData.get('publicDescription') as string;
    const adminComment = formData.get('adminComment') as string;
    const categoryId = formData.get('categoryId') as string;
    const price = parseFloat(formData.get('price') as string);
    const district = formData.get('district') as string;
    const address = formData.get('address') as string;
    const userId = formData.get('userId') as string;
    
    // Parse numeric values with fallbacks
    const rooms = formData.get('rooms') ? parseInt(formData.get('rooms') as string) : null;
    const floor = formData.get('floor') ? parseInt(formData.get('floor') as string) : null;
    const totalFloors = formData.get('totalFloors') ? parseInt(formData.get('totalFloors') as string) : null;
    const houseArea = formData.get('houseArea') ? parseFloat(formData.get('houseArea') as string) : null;
    const landArea = formData.get('landArea') ? parseFloat(formData.get('landArea') as string) : null;
    
    const condition = formData.get('condition') as string;
    const yearBuilt = formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt') as string) : null;
    const noEncumbrances = formData.get('noEncumbrances') === 'true';
    const noKids = formData.get('noKids') === 'true';
    
    console.log("Extracted form data:", {
      title,
      categoryId,
      price
    });
    
    // Generate listing code
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    const prefix = category ? category.name.charAt(0).toUpperCase() : 'X';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const listingCode = `${prefix}-${randomNum}`;

    // Create listing
    console.log("Creating listing in database");
    const newListing = await prisma.listing.create({
      data: {
        title,
        publicDescription,
        adminComment,
        categoryId,
        price,
        district,
        address,
        rooms,
        floor,
        totalFloors,
        houseArea,
        landArea,
        condition,
        yearBuilt,
        noEncumbrances,
        noKids,
        status: 'active',
        userId,
        listingCode,
      },
    });
    console.log("Listing created with ID:", newListing.id);

    // Create history entry for creation
    await prisma.listingHistory.create({
      data: {
        listingId: newListing.id,
        userId: user.id,
        changes: {
          action: "Initial creation of listing"
        },
        action: 'create'
      }
    });

    // Handle image uploads
    const images = formData.getAll('images');
    console.log(`Processing ${images.length} images`);
    
    const imageRecords = [];
    interface UploadedImage {
      filename: string;
      size: string;
      path: string;
      isFeatured: boolean;
    }
    let uploadedImagesData: UploadedImage[] = [];
    
    if (images.length > 0) {
      const imagePromises = images.map(async (file, index) => {
        if (file instanceof File) {
          try {
            const imagePath = await saveImage(file);
            console.log(`Image ${index + 1} saved at path: ${imagePath}`);
            
            uploadedImagesData.push({
              filename: file.name,
              size: Math.round(file.size / 1024) + 'KB',
              path: imagePath,
              isFeatured: index === 0
            });
            
            return prisma.image.create({
              data: {
                listingId: newListing.id,
                path: imagePath,
                isFeatured: index === 0, // First image is featured
              },
            });
          } catch (error) {
            console.error(`Error processing image ${index + 1}:`, error);
            // Continue with other images even if one fails
            return null;
          }
        } else {
          console.warn(`Image ${index + 1} is not a file:`, file);
          return null;
        }
      });

      const results = await Promise.all(imagePromises);
      imageRecords.push(...results.filter(Boolean));
      console.log(`Created ${imageRecords.length} image records`);
      
      // Create history entry for images
      if (uploadedImagesData.length > 0) {
        await prisma.listingHistory.create({
          data: {
            listingId: newListing.id,
            userId: user.id,
            changes: {
              added: uploadedImagesData.map(img => ({
                filename: img.filename,
                size: img.size
              })),
              featuredImage: uploadedImagesData.find(img => img.isFeatured)?.path
            },
            action: 'images'
          }
        });
      }
    } else {
      // If no images were uploaded, use a placeholder
      console.log("No images uploaded, using placeholder");
      let placeholderPath = `/images/${category?.slug || 'placeholder'}_placeholder.png`;
      
      await prisma.image.create({
        data: {
          listingId: newListing.id,
          path: placeholderPath,
          isFeatured: true,
        },
      });
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

    // Build filter
    const filter: any = {};
    
    if (categoryFilter) {
      const category = await prisma.category.findUnique({
        where: { slug: categoryFilter },
      });
      if (category) {
        filter.categoryId = category.id;
      }
    }
    
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: filter,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            where: { isFeatured: true },
            take: 1,
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { dateAdded: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where: filter }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(handleGetAllListings);