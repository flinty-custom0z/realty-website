import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Step 1: Fix the existing district's slug
    console.log('Fixing existing districts...');
    
    const existingDistrict = await prisma.district.findFirst({
      where: { id: 'cmaianwry0000n9hb03zlv221' }
    });
    
    if (existingDistrict) {
      // Create a proper slug from the name
      const slug = existingDistrict.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      
      await prisma.district.update({
        where: { id: existingDistrict.id },
        data: { slug }
      });
      
      console.log(`Updated district "${existingDistrict.name}" with slug "${slug}"`);
    }
    
    // Step 2: Create missing districts from the seed data
    const seedDistricts = [
      'Школьная',
      'Ставропольский',
      'Дружелюбный',
      'Динской р-он',
      'ЗИП-ЖК Московский',
      'Центр',
      'Центральный'
    ];
    
    console.log('Creating missing districts...');
    
    for (const districtName of seedDistricts) {
      // Skip if this is the district we've already fixed
      if (existingDistrict && existingDistrict.name === districtName) {
        console.log(`District already exists: ${districtName}`);
        continue;
      }
      
      // Create slug
      const slug = districtName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
        
      // Check if district with this name or slug already exists
      const existing = await prisma.district.findFirst({
        where: {
          OR: [
            { name: { equals: districtName, mode: 'insensitive' } },
            { slug }
          ],
        },
      });
      
      if (existing) {
        console.log(`District already exists: ${districtName}`);
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
    }
    
    // Step 3: Assign districts to listings
    console.log('\nAssigning districts to listings...');
    
    // Get all districts
    const allDistricts = await prisma.district.findMany();
    console.log(`Found ${allDistricts.length} districts to assign`);
    
    // Get all listings without district
    const listings = await prisma.listing.findMany({
      where: {
        districtId: null
      }
    });
    
    console.log(`Found ${listings.length} listings without district references`);
    
    // Title-based district mapping
    const titleToDistrictMap: Record<string, string> = {
      'Школьная': 'Школьная',
      'Ставропольская': 'Ставропольский',
      'Дружелюбный': 'Дружелюбный',
      'Динской': 'Динской р-он',
      'ЖК Московский': 'ЗИП-ЖК Московский',
      'Московский': 'ЗИП-ЖК Московский',
      'Центральная': 'Центр',
      'Красная': 'Центр',
      'Офисное помещение': 'Центральный',
    };
    
    // Update each listing
    for (const listing of listings) {
      let districtToAssign = null;
      
      // Try to match based on title keywords
      for (const [keyword, districtName] of Object.entries(titleToDistrictMap)) {
        if (listing.title.includes(keyword)) {
          districtToAssign = allDistricts.find(d => d.name === districtName);
          if (districtToAssign) break;
        }
      }
      
      if (!districtToAssign) {
        console.log(`Could not determine district for listing: "${listing.title}" (ID: ${listing.id})`);
        
        // Assign a default district (first one) if no match found
        districtToAssign = allDistricts[0];
        console.log(`Assigning default district: ${districtToAssign.name}`);
      }
      
      // Update the listing
      await prisma.listing.update({
        where: { id: listing.id },
        data: { districtId: districtToAssign.id }
      });
      
      console.log(`Updated listing "${listing.title}" with district: ${districtToAssign.name}`);
    }
    
    console.log('\nDistrict fix completed successfully');
  } catch (error) {
    console.error('Error during district fix:', error);
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