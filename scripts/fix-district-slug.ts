import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fixing district slug...');
    
    const existingDistrict = await prisma.district.findFirst({
      where: { id: 'cmaianwry0000n9hb03zlv221' }
    });
    
    if (existingDistrict) {
      // Create a proper slug from the name
      const slug = 'shkolnaya';
      
      await prisma.district.update({
        where: { id: existingDistrict.id },
        data: { slug }
      });
      
      console.log(`Updated district "${existingDistrict.name}" with slug "${slug}"`);
    } else {
      console.log('District not found');
    }
  } catch (error) {
    console.error('Error fixing district slug:', error);
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