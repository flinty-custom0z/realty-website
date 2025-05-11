import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Predefined list of districts (same as in create-districts-from-seed.ts)
const seedDistricts = [
  'Школьная',
  'Ставропольский',
  'Дружелюбный',
  'Динской р-он', 
  'ЗИП-ЖК Московский',
  'Центр',
  'Центральный'
];

async function main() {
  console.log('Starting to populate districts from seed data...');

  try {
    // Create a map to store district ID by name
    const districtMap = new Map<string, string>();
    
    // Process each district from seed data
    for (const districtName of seedDistricts) {
      // Create slug from name
      const slug = districtName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      // Check if district with this name already exists
      const existing = await prisma.district.findFirst({
        where: {
          OR: [
            { name: { equals: districtName, mode: 'insensitive' } },
            { slug: slug }
          ],
        },
      });

      if (existing) {
        console.log(`District already exists: ${districtName} (${existing.id})`);
        districtMap.set(districtName, existing.id);
        continue;
      }

      // Create new district
      const newDistrict = await prisma.district.create({
        data: {
          name: districtName,
          slug,
        },
      });

      console.log(`Created new district: ${districtName} (${newDistrict.id})`);
      districtMap.set(districtName, newDistrict.id);
    }
    
    // Get all listings without a district reference
    const listingsWithoutDistrict = await prisma.listing.findMany({
      where: {
        districtId: null
      },
      select: {
        id: true,
        title: true
      }
    });
    
    console.log(`Found ${listingsWithoutDistrict.length} listings without district references`);
    
    // Try to assign districts based on title keywords
    const titleKeywords: Record<string, string> = {
      'Школьная': 'Школьная',
      'Ставропольск': 'Ставропольский',
      'Дружелюбн': 'Дружелюбный',
      'Динской': 'Динской р-он',
      'ЗИП': 'ЗИП-ЖК Московский',
      'Московск': 'ЗИП-ЖК Московский',
      'Центр': 'Центр',
      'Центральн': 'Центральный'
    };
    
    // Default district to use if no match is found
    const defaultDistrictName = 'Центр';
    const defaultDistrictId = districtMap.get(defaultDistrictName);
    
    if (!defaultDistrictId) {
      throw new Error(`Default district "${defaultDistrictName}" not found in map`);
    }
    
    // Update each listing
    for (const listing of listingsWithoutDistrict) {
      let matchedDistrictId = null;
      
      // Try to match based on title keywords
      for (const [keyword, districtName] of Object.entries(titleKeywords)) {
        if (listing.title.includes(keyword)) {
          matchedDistrictId = districtMap.get(districtName);
          if (matchedDistrictId) break;
        }
      }
      
      // Use default if no match found
      const districtIdToAssign = matchedDistrictId || defaultDistrictId;
      
      // Find district name by ID
      let districtName = defaultDistrictName;
      for (const [dName, dId] of districtMap.entries()) {
        if (dId === districtIdToAssign) {
          districtName = dName;
          break;
        }
      }
      
      // Update the listing
      await prisma.listing.update({
        where: { id: listing.id },
        data: { districtId: districtIdToAssign }
      });
      
      console.log(`Updated listing "${listing.title}" with district: ${districtName}`);
    }

    console.log('District population completed successfully');
  } catch (error) {
    console.error('Error during district population:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Script completed successfully'))
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  }); 