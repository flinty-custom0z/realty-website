import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking existing districts in the database...');
    const districts = await prisma.district.findMany();
    
    console.log(`Found ${districts.length} districts:`);
    districts.forEach(district => {
      console.log(`- ${district.name} (ID: ${district.id}, Slug: ${district.slug})`);
    });

    console.log('\nChecking listings with district references...');
    const listingsWithDistrict = await prisma.listing.count({
      where: {
        districtId: { not: null }
      }
    });
    
    const totalListings = await prisma.listing.count();
    
    console.log(`${listingsWithDistrict} out of ${totalListings} listings have district references (${Math.round(listingsWithDistrict/totalListings*100)}%)`);
    
  } catch (error) {
    console.error('Error checking districts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Check completed'))
  .catch((e) => {
    console.error('Check failed:', e);
    process.exit(1);
  }); 