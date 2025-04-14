import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
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

// Protected route handler
async function handleCreateListing(req: NextRequest, user: any) {
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
    
    // Generate listing code (e.g., "A-5005")
    const prefix = categoryId.charAt(0).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const listingCode = `${prefix}-${randomNum}`;

    // Create listing
    const listing = await prisma.listing.create({
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
        listingCode,
        userId: user.id,
      },
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    
    if (images && images.length > 0) {
      const imagePromises = images.map(async (image, index) => {
        const imagePath = await saveImage(image);
        return prisma.image.create({
          data: {
            listingId: listing.id,
            path: imagePath,
            isFeatured: index === 0, // First image is featured
          },
        });
      });

      await Promise.all(imagePromises);
    }

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(handleCreateListing);

// Get all listings (for admin)
async function handleGetAllListings(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
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
      prisma.listing.count(),
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(handleGetAllListings);