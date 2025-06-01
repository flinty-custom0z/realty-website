import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map category slugs to their placeholder images - ensure we use the plural form consistently
const categoryImages = {
  'apartments': '/images/apartments_placeholder.png',
  'houses': '/images/houses_placeholder.png',
  'land': '/images/land_placeholder.png',
  'commercial': '/images/commercial_placeholder.png'
};

interface SampleListing {
  title: string;
  publicDescription: string;
  categorySlug: string;
  district: string;
  floor?: number;
  totalFloors?: number;
  houseArea?: number;
  landArea?: number;
  condition?: string;
  price: number;
  noEncumbrances?: boolean;
  noShares?: boolean;
  yearBuilt?: number;
  dealType: 'SALE' | 'RENT';
}

// Function to create a slug from district name
function createSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

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
  
  // Sample data for different categories - FOR SALE
  const sampleListings: SampleListing[] = [
    // Apartments - FOR SALE
    {
      title: 'Школьная 1/4',
      publicDescription: 'Просторная квартира в хорошем состоянии',
      categorySlug: 'apartments',
      district: 'Школьная',
      floor: 1,
      totalFloors: 5,
      houseArea: 39,
      condition: 'Хорошее',
      price: 4550000,
      noEncumbrances: true,
      dealType: 'SALE',
    },
    {
      title: 'Ставропольская 161',
      publicDescription: 'Уютная квартира в центре города',
      categorySlug: 'apartments',
      district: 'Ставропольский',
      floor: 2,
      totalFloors: 9,
      houseArea: 33,
      condition: 'Хорошее',
      price: 4200000,
      noEncumbrances: true,
      dealType: 'SALE',
    },
    
    // Houses - FOR SALE
    {
      title: 'Дружелюбный пос.',
      publicDescription: 'Просторный дом для большой семьи',
      categorySlug: 'houses',
      district: 'Дружелюбный',
      houseArea: 90,
      landArea: 4,
      condition: 'Хорошее',
      price: 6200000,
      yearBuilt: 2015,
      dealType: 'SALE',
    },
    
    // Land - FOR SALE
    {
      title: 'Динской р-он',
      publicDescription: 'Земельный участок для коммерческого использования',
      categorySlug: 'land',
      district: 'Динской р-он',
      landArea: 50,
      price: 45000000,
      dealType: 'SALE',
    },
    
    // Commercial - FOR SALE
    {
      title: 'ЖК Московский',
      publicDescription: 'Коммерческое помещение в новом жилом комплексе',
      categorySlug: 'commercial',
      district: 'ЗИП-ЖК Московский',
      houseArea: 22,
      floor: 1,
      condition: 'Хорошее',
      price: 2250000,
      dealType: 'SALE',
    },
    
    // Apartments - FOR RENT
    {
      title: 'Центральная 15',
      publicDescription: 'Сдается однокомнатная квартира на длительный срок',
      categorySlug: 'apartments',
      district: 'Центр',
      floor: 3,
      totalFloors: 5,
      houseArea: 42,
      condition: 'Отличное',
      price: 25000,
      noShares: true,
      dealType: 'RENT',
    },
    {
      title: 'Красная 45',
      publicDescription: 'Просторная двухкомнатная квартира в центре, все условия для комфортной жизни',
      categorySlug: 'apartments',
      district: 'Центр',
      floor: 4,
      totalFloors: 9,
      houseArea: 58,
      condition: 'Хорошее',
      price: 35000,
      dealType: 'RENT',
    },
    
    // Commercial - FOR RENT
    {
      title: 'Офисное помещение',
      publicDescription: 'Офис в центре города, рядом с транспортной развязкой',
      categorySlug: 'commercial',
      district: 'Центральный',
      houseArea: 45,
      floor: 2,
      condition: 'Хорошее',
      price: 45000,
      dealType: 'RENT',
    },
  ];
  
  // Extract unique district names
  const districtNames = Array.from(new Set(sampleListings.map(listing => listing.district)));
  console.log(`Found ${districtNames.length} unique districts to create`);
  
  // Create or find districts
  const districtMap = new Map<string, string>(); // Map of district name to district ID
  
  for (const districtName of districtNames) {
    const slug = createSlug(districtName);
    
    // Check if district already exists
    let district = await prisma.district.findFirst({
      where: {
        OR: [
          { name: { equals: districtName, mode: 'insensitive' } },
          { slug: slug }
        ]
      }
    });
    
    // Create district if it doesn't exist
    if (!district) {
      district = await prisma.district.create({
        data: {
          name: districtName,
          slug: slug
        }
      });
      console.log(`Created new district: ${districtName} (${district.id})`);
    } else {
      console.log(`Using existing district: ${districtName} (${district.id})`);
    }
    
    // Store district ID for use with listings
    districtMap.set(districtName, district.id);
  }
  
  // Create listings
  for (const listing of sampleListings) {
    // Find category
    const category = categories.find(c => c.slug === listing.categorySlug);
    if (!category) {
      console.warn(`Category ${listing.categorySlug} not found, skipping listing ${listing.title}`);
      continue;
    }
    
    // Get district ID
    const districtId = districtMap.get(listing.district);
    if (!districtId) {
      console.warn(`District ${listing.district} not found in map, skipping listing ${listing.title}`);
      continue;
    }
    
    // Generate listing code
    const prefix = category.name.charAt(0).toUpperCase();
    const dealPrefix = listing.dealType === 'RENT' ? 'А' : 'П'; // А for Аренда (Rent), П for Продажа (Sale)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const listingCode = `${prefix}${dealPrefix}-${randomNum}`;
    
    // Choose random user
    const user = users[Math.floor(Math.random() * users.length)];
    
    // Get the appropriate placeholder image for this category
    const imagePath = categoryImages[listing.categorySlug as keyof typeof categoryImages] || '/images/placeholder.png';
    
    // Create listing
    await prisma.listing.create({
      data: {
        title: listing.title,
        publicDescription: listing.publicDescription,
        categoryId: category.id,
        districtId: districtId,
        floor: listing.floor || null,
        totalFloors: listing.totalFloors || null,
        houseArea: listing.houseArea || null,
        landArea: listing.landArea || null,
        condition: listing.condition || null,
        yearBuilt: listing.yearBuilt || null,
        noEncumbrances: listing.noEncumbrances || false,
        noShares: listing.noShares || false,
        price: listing.price,
        dealType: listing.dealType,
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