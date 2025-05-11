import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Unique districts from seed data
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
  console.log('Starting to create districts from seed data...');

  try {
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

    console.log('District creation completed successfully');
  } catch (error) {
    console.error('Error during district creation:', error);
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