import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function saveImage(image: File): Promise<string> {
  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public/images');
  await mkdir(uploadDir, { recursive: true });

  // Generate unique filename
  const uniqueId = uuidv4();
  const extension = image.name.split('.').pop();
  const filename = `${uniqueId}.${extension}`;
  const filepath = path.join(uploadDir, filename);

  // Save file
  await writeFile(filepath, buffer);
  return `/images/${filename}`;
}

// Update listing
async function handleUpdateListing(req: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    
    // Extract listing data
    const title = formData.get('title') as string;
    const publicDescription = formData.get('publicDescription') as string;
    const adminComment = formData.get('adminComment') as string;
    const categoryId = formData.get('categoryId') as string;
    const price = parseFloat(formData.get('price') as string);
    const district = formData.get('district') as string;
    const rooms = parseInt(formData.get('rooms') as string || '0');
    const floor = parseInt(formData.get('floor') as string || '0');
    const totalFloors = parseInt(formData.get('totalFloors') as string || '0');
    const houseArea = parseFloat(formData.get('houseArea') as string || '0');
    const landArea = parseFloat(formData.get('landArea') as string || '0');
    const condition = formData.get('condition') as string;
    const yearBuilt = parseInt(formData.get('yearBuilt') as string || '0');
    const noEncumbrances = formData.get('noEncumbrances') === 'true';
    const noKids = formData.get('noKids') === 'true';
    const status = formData.get('status') as string || 'active';
    
    // Update listing
    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title,
        publicDescription,
        adminComment,
        categoryId,
        district,
        rooms: rooms || null,
        floor: floor || null,
        totalFloors: totalFloors || null,
        houseArea: houseArea || null,
        landArea: landArea || null,
        condition,
        yearBuilt: yearBuilt || null,
        noEncumbrances,
        noKids,
        price,
        status,
      },
    });

    // Handle image uploads
    const imagesToDelete = JSON.parse(formData.get('imagesToDelete') as string || '[]');
    const newImages = formData.getAll('newImages') as File[];
    
    // Delete images if needed
    if (imagesToDelete.length > 0) {
      for (const imageId of imagesToDelete) {
        const image = await prisma.image.findUnique({
          where: { id: imageId },
        });
        
        if (image) {
          // Delete file from filesystem
          try {
            const filePath = path.join(process.cwd(), 'public', image.path);
            await unlink(filePath);
          } catch (error) {
            console.error('Error deleting file:', error);
          }
          
          // Delete from database
          await prisma.image.delete({
            where: { id: imageId },
          });
        }
      }
    }
    
    // Upload new images
    if (newImages && newImages.length > 0) {
      const currentImages = await prisma.image.count({
        where: { listingId: params.id },
      });
      
      const imagePromises = newImages.map(async (image, index) => {
        const imagePath = await saveImage(image);
        return prisma.image.create({
          data: {
            listingId: listing.id,
            path: imagePath,
            isFeatured: currentImages === 0 && index === 0, // First image is featured if no existing images
          },
        });
      });

      await Promise.all(imagePromises);
    }

    // Update featured image if indicated
    const featuredImageId = formData.get('featuredImageId') as string;
    if (featuredImageId) {
      // First, reset all images to non-featured
      await prisma.image.updateMany({
        where: { listingId: params.id },
        data: { isFeatured: false },
      });
      
      // Then set the selected image as featured
      await prisma.image.update({
        where: { id: featuredImageId },
        data: { isFeatured: true },
      });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PUT = withAuth((req: NextRequest, user: any, params: { params: { id: string } }) => 
  handleUpdateListing(req, user, params)
);

// Delete listing
async function handleDeleteListing(req: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    // Find the listing to delete (to get images)
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Delete images from filesystem
    for (const image of listing.images) {
      try {
        const filePath = path.join(process.cwd(), 'public', image.path);
        await unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Delete listing (will cascade delete images and comments)
    await prisma.listing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const DELETE = withAuth((req: NextRequest, user: any, params: { params: { id: string } }) => 
  handleDeleteListing(req, user, params)
);