import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Map category slugs to their placeholder images
const categoryImages = {
  'apartments': '/images/apartment_placeholder.png',
  'houses': '/images/house_placeholder.png',
  'land': '/images/land_placeholder.png',
  'commercial': '/images/commercial_placeholder.png',
  'industrial': '/images/industrial_placeholder.png'
};

async function main() {
  console.log('Starting to seed listings...');
  
  // Get categories
  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.error('No categories found! Run the main seed script first.');
    return;
  }
  
  // Get users
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.error('No users found! Run the main seed script first.');
    return;
  }
  
  // Sample data for different categories
  const sampleListings = [
    // Apartments
    {
      title: 'Школьная 1/4',
      description: 'Просторная квартира в хорошем состоянии',
      categorySlug: 'apartments',
      district: 'Школьная',
      rooms: 1,
      floor: 1,
      totalFloors: 5,
      houseArea: 39,
      condition: 'Хорошее',
      price: 4550000,
      noEncumbrances: true,
    },
    {
      title: 'Ставропольская 161',
      description: 'Уютная квартира в центре города',
      categorySlug: 'apartments',
      district: 'Ставропольский',
      rooms: 1, 
      floor: 2,
      totalFloors: 9,
      houseArea: 33,
      condition: 'Хорошее',
      price: 4200000,
      noEncumbrances: true,
    },
    
    // Houses
    {
      title: 'Дружелюбный пос.',
      description: 'Просторный дом для большой семьи',
      categorySlug: 'houses',
      district: 'Дружелюбный',
      rooms: 3,
      houseArea: 90,
      landArea: 4,
      condition: 'Хорошее',
      price: 6200000,
      yearBuilt: 2015,
    },
    
    // Land
    {
      title: 'Динской р-он',
      description: 'Земельный участок для коммерческого использования',
      categorySlug: 'land',
      district: 'Динской р-он',
      landArea: 50,
      price: 45000000,
    },
    
    // Commercial
    {
      title: 'ЖК Московский',
      description: 'Коммерческое помещение в новом жилом комплексе',
      categorySlug: 'commercial',
      district: 'ЗИП-ЖК Московский',
      houseArea: 22,
      floor: 1,
      condition: 'Хорошее',
      price: 2250000,
    },
    
    // Industrial
    {
      title: 'Промышленная база',
      description: 'Производственное помещение с офисом',
      categorySlug: 'industrial',
      district: 'Таманский',
      landArea: 130,
      houseArea: 450,
      price: 15000000,
    },
  ];
  
  // Create listings
  for (const listing of sampleListings) {
    // Find category
    const category = categories.find(c => c.slug === listing.categorySlug);
    if (!category) {
      console.warn(`Category ${listing.categorySlug} not found, skipping listing ${listing.title}`);
      continue;
    }
    
    // Generate listing code
    const prefix = category.name.charAt(0).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const listingCode = `${prefix}-${randomNum}`;
    
    // Choose random user
    const user = users[Math.floor(Math.random() * users.length)];
    
    // Get the appropriate placeholder image for this category
    const imagePath = categoryImages[listing.categorySlug as keyof typeof categoryImages] || '/images/placeholder.jpg';
    
    // Create listing
    await prisma.listing.create({
      data: {
        title: listing.title,
        description: listing.description,
        categoryId: category.id,
        district: listing.district,
        rooms: listing.rooms || null,
        floor: listing.floor || null,
        totalFloors: listing.totalFloors || null,
        houseArea: listing.houseArea || null,
        landArea: listing.landArea || null,
        condition: listing.condition || null,
        yearBuilt: listing.yearBuilt || null,
        noEncumbrances: listing.noEncumbrances || false,
        noKids: false,
        price: listing.price,
        listingCode,
        userId: user.id,
        status: 'active',
        images: {
          create: {
            path: imagePath,
            isFeatured: true,
          }
        }
      },
    });
  }
  
  console.log('Sample listings have been created!');
}

main()
  .catch((e) => {
    console.error('Error seeding listings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });