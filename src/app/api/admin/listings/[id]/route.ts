import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function saveImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop();
  const filename = `${uuidv4()}.${ext}`;
  const filePath = path.join(process.cwd(), 'public', 'images', filename);

  await writeFile(filePath, buffer);
  return `/images/${filename}`;
}

export const PUT = withAuth(async (req: NextRequest, { params }: any) => {
  try {
    const formData = await req.formData();
    const listingId = params.id;

    // Basic fields
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const status = formData.get('status') as string;
    const district = formData.get('district') as string;
    const rooms = parseInt(formData.get('rooms') as string || '0');
    const floor = parseInt(formData.get('floor') as string || '0');
    const totalFloors = parseInt(formData.get('totalFloors') as string || '0');
    const houseArea = parseFloat(formData.get('houseArea') as string || '0');
    const landArea = parseFloat(formData.get('landArea') as string || '0');
    const condition = formData.get('condition') as string;
    const yearBuilt = parseInt(formData.get('yearBuilt') as string || '0');
    const categoryId = formData.get('categoryId') as string;
    const publicDescription = formData.get('publicDescription') as string;
    const adminComment = formData.get('adminComment') as string;
    const noEncumbrances = formData.get('noEncumbrances') === 'true';
    const noKids = formData.get('noKids') === 'true';

    const imagesToDelete = JSON.parse(formData.get('imagesToDelete') as string || '[]');
    const featuredImageId = formData.get('featuredImageId') as string;

    // Update listing info
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        price,
        status,
        district,
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
        noKids
      },
    });

    // Handle new image uploads
    const images = formData.getAll('images') as File[];

    if (images.length > 0) {
      const imagePromises = images.map(async (file) => {
        const imagePath = await saveImage(file);
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

      await Promise.all(
        oldImages.map(async (img) => {
          const filePath = path.join(process.cwd(), 'public', img.path);
          await unlink(filePath).catch(() => null);
        })
      );

      await prisma.image.deleteMany({
        where: { id: { in: imagesToDelete }, listingId },
      });
    }

    // Set featured image
    if (featuredImageId) {
      await prisma.image.updateMany({
        where: { listingId },
        data: { isFeatured: false },
      });

      await prisma.image.update({
        where: { id: featuredImageId },
        data: { isFeatured: true },
      });
    }

    const updatedListing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { images: true, comments: true },
    });

    return NextResponse.json(updatedListing);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
});


// Delete listing
async function handleDeleteListing(req: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Delete images from disk
    for (const image of listing.images) {
      try {
        const filePath = path.join(process.cwd(), 'public', image.path);
        await unlink(filePath);
      } catch (error) {
        console.warn('File delete warning:', error);
      }
    }

    // Delete the listing (cascades images/comments)
    await prisma.listing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const DELETE = withAuth((req: NextRequest, user: any, params: { params: { id: string } }) =>
  handleDeleteListing(req, user, params)
);
