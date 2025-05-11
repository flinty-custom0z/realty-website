import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to populate districts from listings...');

  try {
    // Get all unique districts from listings
    const districts = await prisma.listing.groupBy({
      by: ['district'],
      where: {
        district: {
          not: null,
        },
      },
    });

    // Filter out empty districts
    const validDistricts = districts
      .map(d => d.district)
      .filter(Boolean) as string[];

    console.log(`Found ${validDistricts.length} unique districts`);

    // Process each district
    for (const districtName of validDistricts) {
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
        
        // Update listings to reference this district
        const updatedCount = await prisma.listing.updateMany({
          where: {
            district: districtName,
            districtId: null,
          },
          data: {
            districtId: existing.id,
          },
        });
        
        console.log(`Updated ${updatedCount.count} listings to reference district: ${districtName}`);
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

      // Update listings to reference this district
      const updatedCount = await prisma.listing.updateMany({
        where: {
          district: districtName,
          districtId: null,
        },
        data: {
          districtId: newDistrict.id,
        },
      });

      console.log(`Updated ${updatedCount.count} listings to reference district: ${districtName}`);
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