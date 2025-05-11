import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Title-based district mapping
// This maps patterns in titles to district names
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

async function main() {
  console.log('Starting to update listings with district references...');

  try {
    // Get all districts
    const districts = await prisma.district.findMany();
    console.log(`Found ${districts.length} districts`);

    if (districts.length === 0) {
      console.error('No districts found. Run create-districts-from-seed.ts first.');
      return;
    }

    // Get all listings without a district reference
    const listings = await prisma.listing.findMany({
      where: {
        districtId: null
      }
    });
    
    console.log(`Found ${listings.length} listings without district references`);

    // Update each listing
    for (const listing of listings) {
      let districtToAssign = null;
      
      // Try to match based on title keywords
      for (const [keyword, districtName] of Object.entries(titleToDistrictMap)) {
        if (listing.title.includes(keyword)) {
          districtToAssign = districts.find(d => d.name === districtName);
          if (districtToAssign) break;
        }
      }

      if (!districtToAssign) {
        console.log(`Could not determine district for listing: "${listing.title}" (ID: ${listing.id})`);
        
        // Assign a default district (e.g., the first one) if no match found
        // Remove this if you want to leave unmatched listings without a district
        districtToAssign = districts[0];
        console.log(`Assigning default district: ${districtToAssign.name}`);
      }

      // Update the listing
      await prisma.listing.update({
        where: { id: listing.id },
        data: { districtId: districtToAssign.id }
      });

      console.log(`Updated listing "${listing.title}" with district: ${districtToAssign.name}`);
    }

    console.log('Listing district update completed successfully');
  } catch (error) {
    console.error('Error during listing update:', error);
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