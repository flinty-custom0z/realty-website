# Real Estate Website Implementation Guide

This guide will walk you through the complete process of building a real estate listing website similar to realty-23.ru, with admin-only comments, entry and edit forms, and full CRUD functionality.

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Database Design and Implementation](#2-database-design-and-implementation)
3. [Backend Development](#3-backend-development)
4. [Frontend Development](#4-frontend-development)
5. [Admin Dashboard](#5-admin-dashboard)
6. [Testing and Quality Assurance](#6-testing-and-quality-assurance)
7. [Deployment](#7-deployment)

## 1. Project Setup

### 1.1 Environment Setup

First, let's set up our development environment:

```bash
# Install Node.js (v18 or later recommended)
# Create project directory
mkdir realty-website
cd realty-website

# Initialize Next.js project with TypeScript
npx create-next-app@latest . --typescript --eslint --tailwind --app

# Install additional packages
npm install prisma @prisma/client bcrypt jsonwebtoken multer sharp
npm install -D @types/bcrypt @types/jsonwebtoken @types/multer

# Initialize Prisma
npx prisma init
```

### 1.2 Project Structure

Create the following folder structure:

```
realty-website/
├── app/                      # Next.js App Router
│   ├── admin/                # Admin routes
│   ├── api/                  # API routes
│   ├── listing/              # Listing detail pages  
│   ├── listing-category/     # Category listing pages
│   └── ...                   # Other pages
├── components/               # Reusable components
├── lib/                      # Utility functions
├── prisma/                   # Database schema and migrations
│   └── schema.prisma         # Database models
├── public/                   # Static assets
│   └── images/               # Uploaded images
└── ...                       # Config files
```

## 2. Database Design and Implementation

### 2.1 Define Database Schema

Open `prisma/schema.prisma` and define the models:

```prisma
// Database connection
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Generator
generator client {
  provider = "prisma-client-js"
}

// Models
model User {
  id        String    @id @default(cuid())
  name      String
  username  String    @unique
  password  String
  phone     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  listings  Listing[]
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  listings    Listing[]
}

model Listing {
  id              String    @id @default(cuid())
  title           String
  description     String?
  categoryId      String
  category        Category  @relation(fields: [categoryId], references: [id])
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  district        String?
  address         String?
  rooms           Int?
  houseArea       Float?
  landArea        Float?
  floor           Int?
  totalFloors     Int?
  condition       String?
  yearBuilt       Int?
  noEncumbrances  Boolean?  @default(false)
  noKids          Boolean?  @default(false)
  price           Float
  currency        String    @default("₽")
  dateAdded       DateTime  @default(now())
  listingCode     String    @unique
  status          String    @default("active")
  images          Image[]
  comments        Comment[]
}

model Image {
  id        String  @id @default(cuid())
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  path      String
  isFeatured Boolean @default(false)
}

model Comment {
  id        String   @id @default(cuid())
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2.2 Create Database and Run Migrations

Set up your PostgreSQL database and run migrations:

```bash
# Create a .env file with your database connection string
echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/realty_db?schema=public\"" > .env

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 2.3 Seed Initial Data

Create a seed script at `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories = [
    { name: 'Квартиры', slug: 'apartments' },
    { name: 'Дома', slug: 'houses' },
    { name: 'Земельные участки', slug: 'land' },
    { name: 'Коммерция', slug: 'commercial' },
    { name: 'Промышленные объекты', slug: 'industrial' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Seed admin users
  const admins = [
    { name: 'Валерий Ж.', username: 'valeriy', password: 'admin1password' },
    { name: 'Радион А.', username: 'radion', password: 'admin2password' },
  ];

  for (const admin of admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await prisma.user.upsert({
      where: { username: admin.username },
      update: {},
      create: {
        name: admin.name,
        username: admin.username,
        password: hashedPassword,
        phone: '+7938515439',
      },
    });
  }

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed script:

```bash
# Add the seed script to package.json
# In the "scripts" section, add:
# "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"

npm install -D ts-node
npm run seed
```

## 3. Backend Development

### 3.1 Authentication Middleware

Create authentication utility in `lib/auth.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return null;
  }

  return user;
}

export function generateToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyAuth(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    const user = await verifyAuth(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return handler(req, user);
  };
}
```

### 3.2 API Routes

Create essential API routes for the application:

#### 3.2.1 Authentication API

Create `app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user.id);
    
    // Set HTTP-only cookie
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Create `app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().set({
      name: 'token',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 3.2.2 Categories API

Create `app/api/categories/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { listings: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 3.2.3 Listings API

Create `app/api/listings/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const searchQuery = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rooms = searchParams.get('rooms');
    const district = searchParams.get('district');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const sortBy = searchParams.get('sortBy') || 'dateAdded';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = { status: 'active' };

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        filter.categoryId = category.id;
      }
    }

    if (searchQuery) {
      filter.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (minPrice) {
      filter.price = { ...filter.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      filter.price = { ...filter.price, lte: parseFloat(maxPrice) };
    }

    if (rooms) {
      filter.rooms = parseInt(rooms);
    }

    if (district) {
      filter.district = { contains: district, mode: 'insensitive' };
    }

    // Count total listings with filter
    const total = await prisma.listing.count({ where: filter });

    // Get paginated listings
    const listings = await prisma.listing.findMany({
      where: filter,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        images: {
          where: { isFeatured: true },
          take: 1,
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

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
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Create `app/api/listings/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        images: true,
        comments: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if user is authenticated (to include comments)
    const user = await verifyAuth(req);
    if (!user) {
      // Remove comments for non-admin users
      delete listing.comments;
    }

    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 3.2.4 Admin Listings API

Create `app/api/admin/listings/route.ts`:

```typescript
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
    const description = formData.get('description') as string;
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
        description,
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
```

Create `app/api/admin/listings/[id]/route.ts`:

```typescript
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
    const description = formData.get('description') as string;
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
        description,
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
```

#### 3.2.5 Comments API

Create `app/api/admin/comments/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// Create comment (admin only)
async function handleCreateComment(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { listingId, content } = body;

    const comment = await prisma.comment.create({
      data: {
        listingId,
        content,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(handleCreateComment);
```

## 4. Frontend Development

### 4.1 Layout and Components

First, let's create the main layout and essential components:

#### 4.1.1 Main Layout

Create `app/layout.tsx`:

```typescript
import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Вторичный Выбор - Краснодарская недвижимость',
  description: 'Сайт недвижимости в Краснодаре',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <header className="bg-white shadow-sm">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-red-600">
              <div className="flex items-center">
                <span className="text-red-600">ВТОРИЧНЫЙ ВЫБОР</span>
              </div>
              <div className="text-sm text-blue-500">краснодарская недвижимость</div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Главная</Link>
              <Link href="/listing-category/apartments" className="text-gray-600 hover:text-gray-900">Квартиры</Link>
              <Link href="/listing-category/houses" className="text-gray-600 hover:text-gray-900">Дома</Link>
              <Link href="/listing-category/land" className="text-gray-600 hover:text-gray-900">Земельные участки</Link>
              <Link href="/listing-category/commercial" className="text-gray-600 hover:text-gray-900">Коммерция</Link>
              <Link href="/listing-category/industrial" className="text-gray-600 hover:text-gray-900">Промышленные объекты</Link>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer className="bg-white py-6 mt-12 border-t">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">©Все права защищены 2025г.</p>
            <p className="text-sm text-gray-500">Политика конфиденциальности</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
```

#### 4.1.2 Listing Card Component

Create `components/ListingCard.tsx`:

```typescript
import Image from 'next/image';
import Link from 'next/link';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  district?: string;
  rooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  condition?: string;
  imagePath?: string;
  listingCode: string;
}

export default function ListingCard({
  id,
  title,
  price,
  district,
  rooms,
  area,
  floor,
  totalFloors,
  condition,
  imagePath,
  listingCode,
}: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`} className="block group">
      <div className="bg-white shadow rounded-md overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-48 bg-gray-200">
          {imagePath ? (
            <Image
              src={imagePath}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Нет фото
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-500">{title}</h3>
          
          <div className="mt-2 text-sm text-gray-600">
            {district && <p>Район: {district}</p>}
            {rooms && <p>Комнат: {rooms}</p>}
            {area && <p>Площадь: {area} м²</p>}
            {floor && totalFloors && <p>Этаж: {floor}/{totalFloors}</p>}
            {condition && <p>Состояние: {condition}</p>}
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <p className="text-lg font-bold text-gray-900">{price.toLocaleString()} ₽</p>
            <p className="text-xs text-gray-500">Код: {listingCode}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

#### 4.1.3 Filter Sidebar Component

Create `components/FilterSidebar.tsx`:

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterSidebarProps {
  categorySlug: string;
  minPrice?: number;
  maxPrice?: number;
  districts?: string[];
  rooms?: number[];
  conditions?: string[];
}

export default function FilterSidebar({
  categorySlug,
  minPrice = 0,
  maxPrice = 30000000,
  districts = [],
  rooms = [1, 2, 3, 4, 5],
  conditions = ['Черновая', 'Предчистовая', 'Требуется ремонт', 'Частичный ремонт', 'Ремонт под ключ', 'Хорошее', 'Евроремонт'],
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice') as string) : minPrice,
    max: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice') as string) : maxPrice,
  });
  
  const [selectedRooms, setSelectedRooms] = useState<number[]>(
    searchParams.get('rooms') ? [parseInt(searchParams.get('rooms') as string)] : []
  );
  
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    searchParams.get('district') || ''
  );
  
  const [selectedCondition, setSelectedCondition] = useState<string>(
    searchParams.get('condition') || ''
  );
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Build query params
    const params = new URLSearchParams();
    
    if (priceRange.min > minPrice) {
      params.append('minPrice', priceRange.min.toString());
    }
    
    if (priceRange.max < maxPrice) {
      params.append('maxPrice', priceRange.max.toString());
    }
    
    if (selectedRooms.length === 1) {
      params.append('rooms', selectedRooms[0].toString());
    }
    
    if (selectedDistrict) {
      params.append('district', selectedDistrict);
    }
    
    if (selectedCondition) {
      params.append('condition', selectedCondition);
    }
    
    // Preserve search query if exists
    if (searchParams.get('q')) {
      params.append('q', searchParams.get('q') as string);
    }
    
    // Navigate with filters
    router.push(`/listing-category/${categorySlug}?${params.toString()}`);
  };
  
  const handleRoomToggle = (room: number) => {
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter(r => r !== room));
    } else {
      setSelectedRooms([room]); // Only allow one selection
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium mb-4">Фильтры</h3>
      
      {/* Price range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="От"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded text-sm"
          />
          <input
            type="number"
            placeholder="До"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={100000}
          value={priceRange.min}
          onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
          className="w-full mt-2"
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={100000}
          value={priceRange.max}
          onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
      
      {/* Rooms (for apartments/houses) */}
      {categorySlug === 'apartments' || categorySlug === 'houses' ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Количество комнат</label>
          <div className="flex flex-wrap gap-2">
            {rooms.map((room) => (
              <button
                key={room}
                type="button"
                onClick={() => handleRoomToggle(room)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedRooms.includes(room)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {room === 5 ? '5+' : room}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      
      {/* District */}
      <div className="mb-4">
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
          Район
        </label>
        <input
          type="text"
          id="district"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          placeholder="Введите район"
          className="w-full p-2 border rounded text-sm"
        />
      </div>
      
      {/* Condition */}
      <div className="mb-4">
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
          Состояние
        </label>
        <select
          id="condition"
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">Любое</option>
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Фильтровать
      </button>
    </form>
  );
}
```

### 4.2 Home Page

Create `app/page.tsx`:

```typescript
import Image from 'next/image';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { listings: true },
      },
    },
  });
  
  return categories;
}

export default async function Home() {
  const categories = await getCategories();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.id}
            href={`/listing-category/${category.slug}`}
            className="relative overflow-hidden rounded-lg shadow-md h-64 group"
          >
            <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6 z-10">
              <h2 className="text-2xl font-bold text-white mb-2">{category.name}</h2>
              <p className="text-white text-xl">
                {category._count.listings} {getListingText(category._count.listings)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getListingText(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'объявление';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'объявления';
  } else {
    return 'объявлений';
  }
}
```

### 4.3 Category Listings Page

Create `app/listing-category/[slug]/page.tsx`:

```typescript
import { Suspense } from 'react';
import { PrismaClient } from '@prisma/client';
import ListingCard from '@/components/ListingCard';
import FilterSidebar from '@/components/FilterSidebar';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

interface PageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  
  return category;
}

async function getListings(
  categoryId: string,
  searchParams: { [key: string]: string | string[] | undefined }
) {
  // Build filter object
  const filter: any = { 
    categoryId,
    status: 'active',
  };
  
  // Apply search filters
  if (searchParams.q) {
    filter.OR = [
      { title: { contains: searchParams.q as string, mode: 'insensitive' } },
      { description: { contains: searchParams.q as string, mode: 'insensitive' } },
    ];
  }
  
  if (searchParams.minPrice) {
    filter.price = { ...filter.price, gte: parseFloat(searchParams.minPrice as string) };
  }
  
  if (searchParams.maxPrice) {
    filter.price = { ...filter.price, lte: parseFloat(searchParams.maxPrice as string) };
  }
  
  if (searchParams.rooms) {
    filter.rooms = parseInt(searchParams.rooms as string);
  }
  
  if (searchParams.district) {
    filter.district = { contains: searchParams.district as string, mode: 'insensitive' };
  }
  
  if (searchParams.condition) {
    filter.condition = searchParams.condition as string;
  }
  
  // Get page number
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const limit = 30;
  
  // Determine sort order
  const sortField = searchParams.sort || 'dateAdded';
  const sortOrder = searchParams.order || 'desc';
  
  // Count total
  const total = await prisma.listing.count({ where: filter });
  
  // Get paginated results
  const listings = await prisma.listing.findMany({
    where: filter,
    include: {
      images: {
        where: { isFeatured: true },
        take: 1,
      },
    },
    orderBy: {
      [sortField]: sortOrder,
    },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return {
    listings,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    notFound();
  }
  
  const { listings, pagination } = await getListings(category.id, searchParams);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{category.name}</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <FilterSidebar categorySlug={params.slug} />
        </div>
        
        {/* Listings */}
        <div className="w-full md:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              Отображаются {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total} результатов
            </p>
            
            <select 
              className="border rounded p-2"
              // This would need client-side JS to handle the sorting
            >
              <option value="dateAdded_desc">Дата (новые)</option>
              <option value="price_asc">Цена (от низкой)</option>
              <option value="price_desc">Цена (от высокой)</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                district={listing.district || undefined}
                rooms={listing.rooms || undefined}
                area={listing.houseArea || undefined}
                floor={listing.floor || undefined}
                totalFloors={listing.totalFloors || undefined}
                condition={listing.condition || undefined}
                imagePath={listing.images[0]?.path}
                listingCode={listing.listingCode}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="inline-flex">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <a
                    key={page}
                    href={`/listing-category/${params.slug}?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(searchParams).filter(([key]) => key !== 'page')
                      ),
                      page: page.toString(),
                    })}`}
                    className={`px-4 py-2 text-sm border ${
                      page === pagination.page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </a>
                ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-blue-300"
          >
            {isLoading ? 'Создание...' : 'Создать объявление'}
          </button>
        </div>
      </form>
    </div>
  );
}}
              </nav>
            </div>
          )}
          
          {/* No results */}
          {listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">Нет объектов, соответствующих вашим критериям</p>
              <p className="text-sm text-gray-500 mt-2">Попробуйте изменить параметры фильтра</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 4.4 Listing Detail Page

Create `app/listing/[id]/page.tsx`:

```typescript
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

interface PageProps {
  params: { id: string };
}

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      images: true,
    },
  });
  
  return listing;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const listing = await getListing(params.id);
  
  if (!listing) {
    notFound();
  }
  
  // Format date
  const dateAdded = new Date(listing.dateAdded).toLocaleDateString('ru-RU');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href={`/listing-category/${listing.category.slug}`} className="text-blue-500 hover:underline">
          Детали
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">{listing.title}</h1>
      
      {/* Image gallery */}
      <div className="mb-8">
        <div className="relative h-96 bg-gray-200 mb-2 rounded overflow-hidden">
          {listing.images.length > 0 ? (
            <Image
              src={listing.images[0].path}
              alt={listing.title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Нет фото
            </div>
          )}
        </div>
        
        {listing.images.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {listing.images.map((image) => (
              <div key={image.id} className="relative h-20 bg-gray-200 rounded overflow-hidden">
                <Image
                  src={image.path}
                  alt={listing.title}
                  fill
                  className="object-cover cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <div className="bg-white shadow rounded-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Характеристики объекта</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="mb-2"><span className="text-gray-600">Район:</span> {listing.district || 'Не указан'}</p>
                {listing.rooms && <p className="mb-2"><span className="text-gray-600">Комнат:</span> {listing.rooms}</p>}
                {listing.floor && listing.totalFloors && (
                  <p className="mb-2"><span className="text-gray-600">Этаж:</span> {listing.floor}/{listing.totalFloors}</p>
                )}
                {listing.houseArea && (
                  <p className="mb-2"><span className="text-gray-600">Площадь:</span> {listing.houseArea} м²</p>
                )}
                {listing.landArea && (
                  <p className="mb-2"><span className="text-gray-600">Площадь участка:</span> {listing.landArea} сот.</p>
                )}
                <p className="mb-2"><span className="text-gray-600">Цена:</span> {listing.price.toLocaleString()} ₽</p>
              </div>
              <div>
                {listing.yearBuilt && (
                  <p className="mb-2"><span className="text-gray-600">Год:</span> {listing.yearBuilt}</p>
                )}
                {listing.condition && (
                  <p className="mb-2"><span className="text-gray-600">Состояние:</span> {listing.condition}</p>
                )}
                <p className="mb-2"><span className="text-gray-600">Код объекта:</span> {listing.listingCode}</p>
                <p className="mb-2"><span className="text-gray-600">Дата добавления:</span> {dateAdded}</p>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {listing.description && (
            <div className="bg-white shadow rounded-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Комментарий</h2>
              <div className="prose max-w-none">
                {listing.description.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar - Agent info */}
        <div className="w-full md:w-1/3">
          <div className="bg-white shadow rounded-md p-6 sticky top-4">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-3xl text-blue-500">{listing.user.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-bold">{listing.user.name}</h3>
                <p className="text-gray-600">Риелтор</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="mb-2 flex items-center">
                <span className="mr-2">📱</span>
                <a href={`tel:${listing.user.phone}`} className="text-blue-500 hover:underline">
                  {listing.user.phone}
                </a>
              </p>
              <p className="text-sm text-gray-500">Позвонить: {listing.user.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4.5 Search Functionality

Create `components/SearchForm.tsx`:

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFormProps {
  categorySlug?: string;
  initialQuery?: string;
}

export default function SearchForm({ categorySlug, initialQuery = '' }: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    if (categorySlug) {
      router.push(`/listing-category/${categorySlug}?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ваш запрос"
          className="flex-grow p-2 border rounded-l"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition"
        >
          Искать
        </button>
      </div>
    </form>
  );
}
```

Update layout to include search:

```typescript
// In app/layout.tsx
// Add inside header:
<div className="w-full max-w-md mx-auto mt-4">
  <SearchForm />
</div>
```

## 5. Admin Dashboard

### 5.1 Admin Layout

Create `app/admin/layout.tsx`:

```typescript
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, username: true },
    });
    
    return user;
  } catch (error) {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromCookie();
  
  // Redirect to login if not authenticated
  if (!user && !window.location.pathname.includes('/admin/login')) {
    redirect('/admin/login');
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {user && (
        <aside className="w-64 bg-white shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Админ панель</h2>
            <p className="text-sm text-gray-600">Привет, {user.name}</p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="block p-2 hover:bg-gray-100 rounded">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/admin/listings" className="block p-2 hover:bg-gray-100 rounded">
                  Объявления
                </Link>
              </li>
              <li>
                <Link href="/admin/listings/new" className="block p-2 hover:bg-gray-100 rounded">
                  Добавить объявление
                </Link>
              </li>
              <li className="border-t pt-2 mt-4">
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="w-full text-left p-2 hover:bg-gray-100 rounded text-red-600">
                    Выйти
                  </button>
                </form>
              </li>
            </ul>
          </nav>
        </aside>
      )}
      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
```

### 5.2 Login Page

Create `app/admin/login/page.tsx`:

```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }
      
      // Redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Неверное имя пользователя или пароль');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Вход в админ панель</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 5.3 Admin Dashboard Home

Create `app/admin/page.tsx`:

```typescript
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getDashboardStats() {
  const [
    totalListings,
    activeListings,
    listingsByCategory,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { listings: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);
  
  return {
    totalListings,
    activeListings,
    listingsByCategory,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Панель управления</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-700">Всего объявлений</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalListings}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-700">Активных объявлений</h2>
          <p className="text-3xl font-bold mt-2">{stats.activeListings}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-700">Категории</h2>
          <p className="text-3xl font-bold mt-2">{stats.listingsByCategory.length}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">Объявления по категориям</h2>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 font-medium">Категория</th>
                  <th className="pb-3 font-medium text-right">Количество</th>
                </tr>
              </thead>
              <tbody>
                {stats.listingsByCategory.map((category) => (
                  <tr key={category.id} className="border-b last:border-0">
                    <td className="py-3">{category.name}</td>
                    <td className="py-3 text-right">{category._count.listings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Link
          href="/admin/listings/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Добавить объявление
        </Link>
      </div>
    </div>
  );
}
```

### 5.4 Listings Management

Create `app/admin/listings/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Listing {
  id: string;
  title: string;
  price: number;
  listingCode: string;
  status: string;
  category: {
    name: string;
  };
  images: {
    path: string;
  }[];
  dateAdded: string;
  _count: {
    comments: number;
  };
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    fetchListings();
  }, [pagination.page, categoryFilter, statusFilter]);
  
  const fetchListings = async () => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (categoryFilter) {
        params.append('category', categoryFilter);
      }
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/admin/listings?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      setListings(data.listings);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteListing = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Refresh listings
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Ошибка при удалении объявления');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление объявлениями</h1>
        <Link
          href="/admin/listings/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Добавить объявление
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Фильтры</h2>
        </div>
        
        <div className="p-4 flex flex-wrap gap-4">
          <div>
            <label htmlFor="categoryFilter" className="block text-sm text-gray-700 mb-1">
              Категория
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-48 p-2 border rounded"
            >
              <option value="">Все категории</option>
              <option value="apartments">Квартиры</option>
              <option value="houses">Дома</option>
              <option value="land">Земельные участки</option>
              <option value="commercial">Коммерция</option>
              <option value="industrial">Промышленные объекты</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm text-gray-700 mb-1">
              Статус
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 p-2 border rounded"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Загрузка...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 font-medium">Фото</th>
                    <th className="py-3 px-4 font-medium">Название</th>
                    <th className="py-3 px-4 font-medium">Категория</th>
                    <th className="py-3 px-4 font-medium">Код</th>
                    <th className="py-3 px-4 font-medium">Цена</th>
                    <th className="py-3 px-4 font-medium">Статус</th>
                    <th className="py-3 px-4 font-medium">Дата</th>
                    <th className="py-3 px-4 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-12 bg-gray-200">
                          {listing.images && listing.images[0] ? (
                            <Image
                              src={listing.images[0].path}
                              alt={listing.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              Нет фото
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/listings/${listing.id}`} className="text-blue-500 hover:underline">
                          {listing.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{listing.category.name}</td>
                      <td className="py-3 px-4">{listing.listingCode}</td>
                      <td className="py-3 px-4">{listing.price.toLocaleString()} ₽</td>
                      <td className="py-3 px-4">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs ${
                            listing.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {listing.status === 'active' ? 'Активно' : 'Неактивно'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatDate(listing.dateAdded)}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/listings/${listing.id}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Редактировать
                          </Link>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t flex justify-center">
                <div className="flex">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination((prev) => ({ ...prev, page }))}
                      className={`w-8 h-8 flex items-center justify-center mx-1 rounded ${
                        pagination.page === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

### 5.5 Create Listing Form

Create `app/admin/listings/new/page.tsx`:

```typescript
'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImagePreview {
  file: File;
  url: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  
  // UseEffect hook import
  useEffect(() => {
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    district: '',
    rooms: '',
    floor: '',
    totalFloors: '',
    houseArea: '',
    landArea: '',
    condition: '',
    yearBuilt: '',
    noEncumbrances: false,
    noKids: false,
    price: '',
  });
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data);
        
        // Set default category
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newPreviews = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };
  
  const removeImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      // Add images to FormData
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });
      
      const response = await fetch('/api/admin/listings', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }
      
      const data = await response.json();
      
      // Redirect to edit page
      router.push(`/admin/listings/${data.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при создании объявления');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Добавить новое объявление</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Название *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Категория *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Цена (₽) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
              Район
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
              Количество комнат
            </label>
            <input
              type="number"
              id="rooms"
              name="rooms"
              min="0"
              value={formData.rooms}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
              Этаж
            </label>
            <input
              type="number"
              id="floor"
              name="floor"
              min="0"
              value={formData.floor}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700 mb-1">
              Этажность
            </label>
            <input
              type="number"
              id="totalFloors"
              name="totalFloors"
              min="0"
              value={formData.totalFloors}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="houseArea" className="block text-sm font-medium text-gray-700 mb-1">
              Площадь (м²)
            </label>
            <input
              type="number"
              id="houseArea"
              name="houseArea"
              min="0"
              step="0.1"
              value={formData.houseArea}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="landArea" className="block text-sm font-medium text-gray-700 mb-1">
              Площадь участка (сот.)
            </label>
            <input
              type="number"
              id="landArea"
              name="landArea"
              min="0"
              step="0.1"
              value={formData.landArea}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
              Состояние
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Выберите состояние</option>
              <option value="Черновая">Черновая</option>
              <option value="Предчистовая">Предчистовая</option>
              <option value="Требуется ремонт">Требуется ремонт</option>
              <option value="Частичный ремонт">Частичный ремонт</option>
              <option value="Ремонт под ключ">Ремонт под ключ</option>
              <option value="Хорошее">Хорошее</option>
              <option value="Евроремонт">Евроремонт</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
              Год постройки
            </label>
            <input
              type="number"
              id="yearBuilt"
              name="yearBuilt"
              min="1900"
              max="2030"
              value={formData.yearBuilt}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="noEncumbrances"
                name="noEncumbrances"
                checked={formData.noEncumbrances}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="noEncumbrances" className="text-sm text-gray-700">
                Без обременений
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="noKids"
                name="noKids"
                checked={formData.noKids}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="noKids" className="text-sm text-gray-700">
                Без детей
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фотографии
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))
```



### 5.6 Edit Listing Form

Create `app/admin/listings/[id]/page.tsx`:

```typescript
'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface ListingFormData {
  title: string;
  description: string;
  categoryId: string;
  district: string;
  rooms: string;
  floor: string;
  totalFloors: string;
  houseArea: string;
  landArea: string;
  condition: string;
  yearBuilt: string;
  noEncumbrances: boolean;
  noKids: boolean;
  price: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
}

interface ImageData {
  id: string;
  path: string;
  isFeatured: boolean;
}

interface ListingData extends ListingFormData {
  id: string;
  listingCode: string;
  dateAdded: string;
  images: ImageData[];
  category: Category;
  user: {
    id: string;
    name: string;
  };
  comments: {
    id: string;
    content: string;
    createdAt: string;
  }[];
}

interface PageProps {
  params: { id: string };
}

export default function EditListingPage({ params }: PageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // For image uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ file: File; url: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string>('');
  
  // For comments
  const [newComment, setNewComment] = useState('');
  
  // Form data
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    categoryId: '',
    district: '',
    rooms: '',
    floor: '',
    totalFloors: '',
    houseArea: '',
    landArea: '',
    condition: '',
    yearBuilt: '',
    noEncumbrances: false,
    noKids: false,
    price: '',
    status: 'active',
  });
  
  // Fetch listing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch listing
        const listingRes = await fetch(`/api/admin/listings/${params.id}`);
        if (!listingRes.ok) {
          throw new Error('Failed to fetch listing');
        }
        const listingData = await listingRes.json();
        setListing(listingData);
        
        // Set form data
        setFormData({
          title: listingData.title,
          description: listingData.description || '',
          categoryId: listingData.categoryId,
          district: listingData.district || '',
          rooms: listingData.rooms?.toString() || '',
          floor: listingData.floor?.toString() || '',
          totalFloors: listingData.totalFloors?.toString() || '',
          houseArea: listingData.houseArea?.toString() || '',
          landArea: listingData.landArea?.toString() || '',
          condition: listingData.condition || '',
          yearBuilt: listingData.yearBuilt?.toString() || '',
          noEncumbrances: listingData.noEncumbrances || false,
          noKids: listingData.noKids || false,
          price: listingData.price.toString(),
          status: listingData.status,
        });
        
        // Set featured image
        const featuredImage = listingData.images.find(img => img.isFeatured);
        if (featuredImage) {
          setFeaturedImageId(featuredImage.id);
        }
        
        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (!categoriesRes.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load listing data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newPreviews = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };
  
  const removeImagePreview = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index].url);
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const toggleImageToDelete = (imageId: string) => {
    setImagesToDelete(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
    
    // If this was the featured image, unset it
    if (featuredImageId === imageId) {
      setFeaturedImageId('');
    }
  };
  
  const setImageAsFeatured = (imageId: string) => {
    setFeaturedImageId(imageId);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      // Add new images to FormData
      imageFiles.forEach(file => {
        formDataToSend.append('newImages', file);
      });
      
      // Add images to delete
      formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      
      // Set featured image
      if (featuredImageId) {
        formDataToSend.append('featuredImageId', featuredImageId);
      }
      
      const response = await fetch(`/api/admin/listings/${params.id}`, {
        method: 'PUT',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing');
      }
      
      // Clear image uploads
      setImageFiles([]);
      setImagePreviews([]);
      setImagesToDelete([]);
      
      // Show success message
      setSuccess('Объявление успешно обновлено');
      
      // Refresh listing data
      const updatedListing = await response.json();
      setListing(prev => {
        if (!prev) return updatedListing;
        return {
          ...prev,
          ...updatedListing,
          images: updatedListing.images || prev.images,
        };
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при обновлении объявления');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: params.id,
          content: newComment,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const comment = await response.json();
      
      // Add to listing comments
      setListing(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, comment],
        };
      });
      
      // Clear comment form
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Не удалось добавить комментарий');
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Загрузка...</p>
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error || 'Объявление не найдено'}</p>
        <Link href="/admin/listings" className="text-red-600 underline mt-2 inline-block">
          Вернуться к списку объявлений
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Редактирование объявления</h1>
        <div className="space-x-2">
          <Link
            href={`/listing/${listing.id}`}
            target="_blank"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Просмотр на сайте
          </Link>
          
          <Link
            href="/admin/listings"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Назад к списку
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h2 className="text-lg font-medium">Детали объявления</h2>
          <div className="text-sm text-gray-500">
            Код объекта: {listing.listingCode} | Добавлено: {formatDate(listing.dateAdded)}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Название *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Цена (₽) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Статус *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="active">Активно</option>
                <option value="inactive">Неактивно</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                Район
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                Количество комнат
              </label>
              <input
                type="number"
                id="rooms"
                name="rooms"
                min="0"
                value={formData.rooms}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Этаж
              </label>
              <input
                type="number"
                id="floor"
                name="floor"
                min="0"
                value={formData.floor}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700 mb-1">
                Этажность
              </label>
              <input
                type="number"
                id="totalFloors"
                name="totalFloors"
                min="0"
                value={formData.totalFloors}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="houseArea" className="block text-sm font-medium text-gray-700 mb-1">
                Площадь (м²)
              </label>
              <input
                type="number"
                id="houseArea"
                name="houseArea"
                min="0"
                step="0.1"
                value={formData.houseArea}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="landArea" className="block text-sm font-medium text-gray-700 mb-1">
                Площадь участка (сот.)
              </label>
              <input
                type="number"
                id="landArea"
                name="landArea"
                min="0"
                step="0.1"
                value={formData.landArea}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Состояние
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Выберите состояние</option>
                <option value="Черновая">Черновая</option>
                <option value="Предчистовая">Предчистовая</option>
                <option value="Требуется ремонт">Требуется ремонт</option>
                <option value="Частичный ремонт">Частичный ремонт</option>
                <option value="Ремонт под ключ">Ремонт под ключ</option>
                <option value="Хорошее">Хорошее</option>
                <option value="Евроремонт">Евроремонт</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                Год постройки
              </label>
              <input
                type="number"
                id="yearBuilt"
                name="yearBuilt"
                min="1900"
                max="2030"
                value={formData.yearBuilt}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noEncumbrances"
                  name="noEncumbrances"
                  checked={formData.noEncumbrances}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="noEncumbrances" className="text-sm text-gray-700">
                  Без обременений
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noKids"
                  name="noKids"
                  checked={formData.noKids}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="noKids" className="text-sm text-gray-700">
                  Без детей
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Фотографии</h3>
            
            {listing.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">Текущие фотографии:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {listing.images.map(image => (
                    <div
                      key={image.id}
                      className={`
                        relative group border-2 rounded p-1
                        ${featuredImageId === image.id ? 'border-blue-500' : 'border-gray-200'}
                        ${imagesToDelete.includes(image.id) ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="relative h-32">
                        <Image
                          src={image.path}
                          alt="Listing image"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover rounded"
                        />
                      </div>
                      
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => toggleImageToDelete(image.id)}
                          className={`
                            p-1 rounded-full w-7 h-7 flex items-center justify-center
                            ${imagesToDelete.includes(image.id) ? 'bg-red-500 text-white' : 'bg-white text-red-500 opacity-0 group-hover:opacity-100'}
                            transition-opacity
                          `}
                        >
                          {imagesToDelete.includes(image.id) ? '↩' : '×'}
                        </button>
                        
                        {!imagesToDelete.includes(image.id) && (
                          <button
                            type="button"
                            onClick={() => setImageAsFeatured(image.id)}
                            className={`
                              p-1 rounded-full w-7 h-7 flex items-center justify-center
                              ${featuredImageId === image.id ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 opacity-0 group-hover:opacity-100'}
                              transition-opacity
                            `}
                          >
                            ★
                          </button>
                        )}
                      </div>
                      
                      {featuredImageId === image.id && (
                        <div className="absolute bottom-2 left-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          Главное фото
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-700 mb-2">Добавить новые фотографии:</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
              />
              
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImagePreview(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-blue-300"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Comments section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Комментарии</h3>
        
        <div className="mb-4">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Добавить комментарий"
              className="flex-grow p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              disabled={!newComment.trim()}
            >
              Добавить
            </button>
          </form>
        </div>
        
        {listing.comments && listing.comments.length > 0 ? (
          <div className="space-y-4">
            {listing.comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-500 mb-1">
                  {formatDate(comment.createdAt)}
                </div>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Нет комментариев</p>
        )}
      </div>
    </div>
  );
}
```

## 6. Testing and Quality Assurance

After completing the implementation, thorough testing is crucial to ensure everything works as expected.

### 6.1 Manual Testing Checklist

Create a testing plan that covers all functionality:

```
#### General Pages
- [x] Home page loads correctly with all categories
- [x] Navigation links work
- [x] Search functionality works

#### Category Pages
- [x] All category pages load correctly
- [x] Listings display properly with images and information
- [x] Filters work as expected (price, rooms, district, etc.)
- [x] Pagination works

#### Listing Detail Pages
- [x] All information displays correctly
- [x] Image gallery works
- [x] Agent information is shown
- [x] Comments are hidden from public view

#### Admin Authentication
- [x] Login works with correct credentials
- [x] Login fails with incorrect credentials
- [x] Protected routes redirect to login when not authenticated
- [x] Logout functionality works

#### Admin Dashboard
- [x] Dashboard shows correct statistics
- [x] Listings management page shows all listings
- [x] Listing creation form works correctly
- [x] Image uploads work
- [x] Listing edit form populates and saves correctly
- [x] Image management (delete, set featured) works
- [x] Comments can be added and are visible to admins only

#### Mobile Responsiveness
- [x] All pages are usable on mobile devices
- [x] Forms work correctly on small screens
- [x] Filters and navigation are accessible on mobile

#### Browser Compatibility
- [x] Test on Chrome, Firefox, Safari, and Edge
- [x] Ensure consistent behavior across browsers
```

### 6.2 Testing Approach

1. **Unit Testing**: Test individual components and API endpoints
   - Test authentication functions
   - Test filter functionality
   - Test image upload and processing

2. **Integration Testing**: Test interaction between components
   - Test form submissions
   - Test database operations through API

3. **End-to-End Testing**: Test complete flows
   - Create listing flow
   - Filter and view listings flow
   - Admin login and management flow

### 6.3 Common Issues and Solutions

Here are some common issues you might encounter during testing and their solutions:

1. **Problem**: Images not displaying
   **Solution**: Check image paths and ensure public directory is accessible

2. **Problem**: Form submission fails
   **Solution**: Check form validation and ensure all required fields are filled correctly

3. **Problem**: Authentication issues
   **Solution**: Check JWT token handling and cookie settings

4. **Problem**: Database queries returning unexpected results
   **Solution**: Verify filter parameters and data types

5. **Problem**: Mobile layout issues
   **Solution**: Adjust responsive breakpoints and ensure all elements are properly sized

## 7. Deployment

Let's cover the steps to deploy the application to a production environment.

### 7.1 Preparing for Deployment

1. Environment Configuration:
   ```bash
   # Create a production .env file
   cp .env .env.production
   # Edit .env.production with production values
   nano .env.production
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Test the production build locally:
   ```bash
   npm start
   ```

### 7.2 Deployment Options

#### 7.2.1 VPS Deployment (DigitalOcean/Linode)

1. Provision a VPS (2GB RAM minimum recommended)

2. Install required software:
   ```bash
   # Update and install dependencies
   apt update && apt upgrade -y
   apt install -y nginx postgresql nodejs npm

   # Install PostgreSQL
   apt install -y postgresql postgresql-contrib
   
   # Set up PostgreSQL
   sudo -u postgres psql
   CREATE DATABASE realty_db;
   CREATE USER realty_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE realty_db TO realty_user;
   \q
   ```

3. Set up Nginx:
   ```bash
   # Create a new Nginx configuration
   nano /etc/nginx/sites-available/realty-site
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /images/ {
           alias /var/www/realty-website/public/images/;
       }
   }
   ```

   Enable the site:
   ```bash
   ln -s /etc/nginx/sites-available/realty-site /etc/nginx/sites-enabled/
   nginx -t  # Test configuration
   systemctl restart nginx
   ```

4. Set up SSL with Let's Encrypt:
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

5. Clone and set up the application:
   ```bash
   mkdir -p /var/www
   cd /var/www
   git clone https://github.com/your-username/realty-website.git
   cd realty-website
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   nano .env  # Add production database URL and other settings
   
   # Build the application
   npm run build
   
   # Run database migrations
   npx prisma migrate deploy
   
   # Seed initial data
   npm run seed
   ```

6. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "realty-website" -- start
   pm2 startup
   pm2 save
   ```

7. Set up automatic backups:
   ```bash
   # Create backup script
   mkdir -p /var/backups/realty
   nano /usr/local/bin/backup-realty.sh
   ```

   Script content:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/realty"
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   
   # Database backup
   sudo -u postgres pg_dump realty_db > $BACKUP_DIR/realty_db_$TIMESTAMP.sql
   
   # Images backup
   tar -czf $BACKUP_DIR/images_$TIMESTAMP.tar.gz /var/www/realty-website/public/images
   
   # Remove backups older than 7 days
   find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete
   find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +7 -delete
   ```

   Make it executable and add to crontab:
   ```bash
   chmod +x /usr/local/bin/backup-realty.sh
   crontab -e
   ```

   Add this line:
   ```
   0 2 * * * /usr/local/bin/backup-realty.sh
   ```

#### 7.2.2 Serverless Deployment (Vercel)

1. Set up a GitHub repository for your project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/realty-website.git
   git push -u origin main
   ```

2. Sign up for Vercel and connect to your GitHub repository

3. Set up environment variables in the Vercel dashboard:
   - `DATABASE_URL` - Connection string to your PostgreSQL database
   - `JWT_SECRET` - Secret key for JWT tokens

4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Deploy from the Vercel dashboard or use the CLI:
   ```bash
   npm install -g vercel
   vercel
   ```

6. Set up a managed PostgreSQL database (Supabase, ElephantSQL, etc.)
   - Create a new database
   - Run migrations:
     ```bash
     DATABASE_URL=your_connection_string npx prisma migrate deploy
     ```
   - Seed data:
     ```bash
     DATABASE_URL=your_connection_string npm run seed
     ```

7. Configure your custom domain in the Vercel dashboard

### 7.3 Post-Deployment Tasks

1. Verify all functionality works correctly in the production environment

2. Set up monitoring:
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Configure error monitoring (Sentry)

3. Implement regular database backups

4. Ensure secure admin credentials in production

5. Set up analytics (Google Analytics, Plausible, etc.)

### 7.4 Maintenance Plan

1. Regular updates:
   - Update dependencies monthly
   - Apply security patches as needed

2. Monitor performance:
   - Check server load and database performance
   - Optimize queries if response times increase

3. Content moderation:
   - Review listings regularly
   - Archive old listings if necessary

4. Feature enhancements:
   - Gather feedback and plan improvements
   - Implement new features based on user needs
