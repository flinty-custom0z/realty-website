import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  try {
    console.log('Updating district slugs...');
    
    // Get all districts
    const districts = await prisma.district.findMany();
    console.log(`Found ${districts.length} districts`);
    
    let updatedCount = 0;
    
    // Update each district with a missing or invalid slug
    for (const district of districts) {
      if (!district.slug || district.slug.trim() === '') {
        const newSlug = createSlug(district.name);
        
        // Update the district with a proper slug
        await prisma.district.update({
          where: { id: district.id },
          data: { slug: newSlug }
        });
        
        console.log(`Updated district "${district.name}" with new slug "${newSlug}"`);
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} districts with proper slugs`);
  } catch (error) {
    console.error('Error updating district slugs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(console.error)
  .finally(() => console.log('District slug update complete')); 