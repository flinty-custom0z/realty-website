import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to transliterate Cyrillic to Latin characters
function transliterate(text: string): string {
  return text.toLowerCase()
    // Replace Cyrillic characters with Latin equivalents
    .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g')
    .replace(/д/g, 'd').replace(/е/g, 'e').replace(/ё/g, 'yo').replace(/ж/g, 'zh')
    .replace(/з/g, 'z').replace(/и/g, 'i').replace(/й/g, 'y').replace(/к/g, 'k')
    .replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o')
    .replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't')
    .replace(/у/g, 'u').replace(/ф/g, 'f').replace(/х/g, 'kh').replace(/ц/g, 'ts')
    .replace(/ч/g, 'ch').replace(/ш/g, 'sh').replace(/щ/g, 'sch').replace(/ъ/g, '')
    .replace(/ы/g, 'y').replace(/ь/g, '').replace(/э/g, 'e').replace(/ю/g, 'yu')
    .replace(/я/g, 'ya')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove any remaining non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9\-]+/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log('Starting to fix district slugs...');

  try {
    // Get all districts
    const districts = await prisma.district.findMany();
    console.log(`Found ${districts.length} districts`);

    // Find districts with empty or invalid slugs
    const districtsToFix = districts.filter(d => !d.slug || d.slug.trim() === '');
    console.log(`Found ${districtsToFix.length} districts with empty slugs`);

    if (districtsToFix.length === 0) {
      console.log('No districts need fixing');
      return;
    }

    // Track used slugs to avoid conflicts
    const usedSlugs = new Set(districts.filter(d => d.slug && d.slug.trim() !== '').map(d => d.slug));

    for (const district of districtsToFix) {
      let slug = transliterate(district.name);
      
      // If slug is empty, use a fallback
      if (!slug) {
        slug = `district-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Ensure slug is unique
      let uniqueSlug = slug;
      let counter = 1;
      
      while (usedSlugs.has(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      // Update the district
      await prisma.district.update({
        where: { id: district.id },
        data: { slug: uniqueSlug }
      });

      usedSlugs.add(uniqueSlug);
      console.log(`Updated district "${district.name}" with slug: ${uniqueSlug}`);
    }

    console.log('District slug fix completed successfully');
  } catch (error) {
    console.error('Error during district slug fix:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 