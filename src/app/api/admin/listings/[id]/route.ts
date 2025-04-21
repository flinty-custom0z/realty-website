import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { writeFile, mkdir, unlink, access } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

// GET method (fixed)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Missing ID in request' }, { status: 400 });
    }
    
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        images: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function ensureDirectoryExists(dirPath: string) {
  try {
    await access(dirPath);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

async function saveImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filename = `${uuidv4()}.${ext}`;
  const imagesDir = path.join(process.cwd(), 'public', 'images');

  await ensureDirectoryExists(imagesDir);
  const filePath = path.join(imagesDir, filename);

  // Save the file
  await writeFile(filePath, buffer);
  
  // Return path relative to public directory
  return `/images/${filename}`;
}

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const formData = await req.formData();
    const listingId = params.id;
    const user = (req as any).user;

    // Get the original listing before changes for history tracking
    const originalListing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        title: true,
        publicDescription: true,
        adminComment: true,
        categoryId: true,
        district: true,
        address: true,
        rooms: true,
        floor: true,
        totalFloors: true,
        houseArea: true,
        landArea: true,
        condition: true,
        yearBuilt: true,
        noEncumbrances: true,
        noKids: true,
        price: true,
        status: true,
        userId: true,
      }
    });

    if (!originalListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Basic fields
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const status = formData.get('status') as string;
    const district = formData.get('district') as string;
    const address = formData.get('address') as string;
    const rooms = formData.get('rooms') ? parseInt(formData.get('rooms') as string) : null;
    const floor = formData.get('floor') ? parseInt(formData.get('floor') as string) : null;
    const totalFloors = formData.get('totalFloors') ? parseInt(formData.get('totalFloors') as string) : null;
    const houseArea = formData.get('houseArea') ? parseFloat(formData.get('houseArea') as string) : null;
    const landArea = formData.get('landArea') ? parseFloat(formData.get('landArea') as string) : null;
    const condition = formData.get('condition') as string;
    const yearBuilt = formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt') as string) : null;
    const categoryId = formData.get('categoryId') as string;
    const publicDescription = formData.get('publicDescription') as string;
    const adminComment = formData.get('adminComment') as string;
    const noEncumbrances = formData.get('noEncumbrances') === 'true';
    const noKids = formData.get('noKids') === 'true';
    const userId = formData.get('userId') as string;

    const imagesToDelete = JSON.parse(formData.get('imagesToDelete') as string || '[]');
    const featuredImageId = formData.get('featuredImageId') as string;

    // Prepare updated data
    const updatedData = {
      title,
      price,
      status,
      district,
      address,
      rooms,
      floor,
      totalFloors,
      houseArea,
      landArea,
      condition,
      yearBuilt,
      categoryId,
      publicDescription,
      adminComment,
      noEncumbrances,
      noKids,
      userId,
    };

    // Calculate changes for history
    const changes: Record<string, { before: any, after: any }> = {};
    
    // Compare each field to detect changes
    Object.keys(updatedData).forEach(key => {
      const typedKey = key as keyof typeof updatedData;
      const originalValue = originalListing[typedKey as keyof typeof originalListing];
      const newValue = updatedData[typedKey];
      
      // Only record if values are different
      if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          before: originalValue,
          after: newValue
        };
      }
    });
    
    // Update listing info
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: updatedData,
    });

    // Create history entry if there are changes
    if (Object.keys(changes).length > 0) {
      await prisma.listingHistory.create({
        data: {
          listingId,
          userId: user.id,
          changes,
          action: 'update'
        }
      });
    }

    // Track image changes
    let imageChanges: Record<string, any> = {};
    let hasImageChanges = false;

    // Handle new image uploads
    const newImages = formData.getAll('newImages') as File[];

    if (newImages.length > 0) {
      const imagePromises = newImages.map(async (file) => {
        const imagePath = await saveImage(file);
        hasImageChanges = true;
        imageChanges.added = imageChanges.added || [];
        imageChanges.added.push({
          filename: file.name,
          size: Math.round(file.size / 1024) + 'KB'
        });
        return prisma.image.create({
          data: {
            listingId,
            path: imagePath,
            isFeatured: false,
          },
        });
      });
      await Promise.all(imagePromises);
    }

    // Delete images
    if (imagesToDelete.length > 0) {
      const oldImages = await prisma.image.findMany({
        where: { id: { in: imagesToDelete }, listingId },
      });

      hasImageChanges = true;
      imageChanges.deleted = oldImages.map(img => ({
        id: img.id,
        path: img.path
      }));

      await Promise.all(
        oldImages.map(async (img) => {
          try {
          const filePath = path.join(process.cwd(), 'public', img.path);
            await unlink(filePath).catch(() => console.log(`Could not delete file: ${filePath}`));
          } catch (error) {
            console.error(`Error deleting image file:`, error);
          }
        })
      );

      // Check if we're deleting the featured image
      const deletedFeaturedImage = oldImages.some(img => img.isFeatured);
      
      await prisma.image.deleteMany({
        where: { id: { in: imagesToDelete }, listingId },
      });

      // If we deleted the featured image, set the next available image as featured
      if (deletedFeaturedImage && !featuredImageId) {
        const remainingImage = await prisma.image.findFirst({
          where: { listingId },
          orderBy: { id: 'asc' },
        });

        if (remainingImage) {
          await prisma.image.update({
            where: { id: remainingImage.id },
            data: { isFeatured: true },
          });
          
          hasImageChanges = true;
          imageChanges.featuredChanged = {
            previous: 'deleted',
            new: remainingImage.id,
            automatic: true
          };
        }
      }
    }

    // Set featured image
    if (featuredImageId) {
      const previousFeatured = await prisma.image.findFirst({
        where: { 
          listingId,
          isFeatured: true,
          id: { not: featuredImageId }
        },
      });

      if (previousFeatured) {
        hasImageChanges = true;
        imageChanges.featuredChanged = {
          previous: previousFeatured.id,
          new: featuredImageId
        };
      }

      await prisma.image.updateMany({
        where: { listingId },
        data: { isFeatured: false },
      });

      await prisma.image.update({
        where: { id: featuredImageId },
        data: { isFeatured: true },
      });
    }

    // Create history entry for image changes if any occurred
    if (hasImageChanges) {
      await prisma.listingHistory.create({
        data: {
          listingId,
          userId: user.id,
          changes: imageChanges,
          action: 'images'
        }
      });
    }

    return NextResponse.json(updatedListing);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
});


// Delete listing
async function handleDeleteListing(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = (req as any).user;
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Create history entry for deletion before deleting the listing
    await prisma.listingHistory.create({
      data: {
        listingId: params.id,
        userId: user.id,
        changes: {
          action: "Listing deletion",
          title: listing.title,
          listingCode: listing.listingCode
        },
        action: 'delete'
      }
    });

    // Delete images from disk
    for (const image of listing.images) {
      try {
        const filePath = path.join(process.cwd(), 'public', image.path);
        await unlink(filePath);
      } catch (error) {
        console.warn('File delete warning:', error);
      }
    }

    // Delete the listing (cascades images)
    await prisma.listing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const DELETE = withAuth(handleDeleteListing);