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

// Default district names and their corresponding slugs
const defaultDistricts: { name: string; slug: string }[] = [
  { name: 'Школьная', slug: 'shkolnaya' },
  { name: 'Ставропольский', slug: 'stavropolskij' },
  { name: 'Дружелюбный', slug: 'druzhelyubnyj' },
  { name: 'Динской р-он', slug: 'dinskoj-r-on' },
  { name: 'ЗИП-ЖК Московский', slug: 'zip-zhk-moskovskij' },
  { name: 'Центр', slug: 'centr' },
  { name: 'Центральный', slug: 'centralnyj' },
  { name: 'Прикубанский округ', slug: 'prikubanskij-okrug' }
];

async function checkDistrictIntegrity() {
  console.log('\n=== CHECKING DISTRICT DATA INTEGRITY ===\n');
  
  // Get all districts
  const districts = await prisma.district.findMany();
  console.log(`Found ${districts.length} districts in the database`);
  
  // Check for districts with missing or empty slugs
  const invalidDistricts = districts.filter(d => !d.slug || d.slug.trim() === '');
  
  if (invalidDistricts.length > 0) {
    console.log(`\n❌ Found ${invalidDistricts.length} districts with missing or invalid slugs:`);
    invalidDistricts.forEach(d => {
      console.log(`   - ID: ${d.id}, Name: "${d.name}", Slug: "${d.slug || ''}"`);
    });
  } else {
    console.log('✅ All districts have valid slugs');
  }
  
  // Get all listings with their districts
  const listingsWithDistricts = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      districtId: true,
      districtRef: true
    }
  });
  
  // Check for listings without district references
  const listingsWithoutDistrict = listingsWithDistricts.filter(l => !l.districtId);
  
  if (listingsWithoutDistrict.length > 0) {
    console.log(`\n❌ Found ${listingsWithoutDistrict.length}/${listingsWithDistricts.length} listings without district references:`);
    listingsWithoutDistrict.slice(0, 5).forEach(l => {
      console.log(`   - ID: ${l.id}, Title: "${l.title}"`);
    });
    
    if (listingsWithoutDistrict.length > 5) {
      console.log(`   ... and ${listingsWithoutDistrict.length - 5} more`);
    }
  } else {
    console.log(`✅ All ${listingsWithDistricts.length} listings have district references`);
  }
  
  return {
    districts,
    invalidDistricts,
    listingsWithoutDistrict
  };
}

async function fixDistrictSlugs(invalidDistricts: any[]) {
  console.log('\n=== FIXING DISTRICT SLUGS ===\n');
  
  if (invalidDistricts.length === 0) {
    console.log('No invalid districts to fix');
    return;
  }
  
  let fixedCount = 0;
  
  for (const district of invalidDistricts) {
    // Try to find a matching default district
    const defaultDistrict = defaultDistricts.find(d => 
      d.name.toLowerCase() === district.name.toLowerCase()
    );
    
    // Use default slug if available, otherwise generate one
    const newSlug = defaultDistrict?.slug || createSlug(district.name);
    
    // Update the district with a proper slug
    await prisma.district.update({
      where: { id: district.id },
      data: { slug: newSlug }
    });
    
    console.log(`✅ Updated district "${district.name}" with new slug "${newSlug}"`);
    fixedCount++;
  }
  
  console.log(`\nFixed ${fixedCount} districts with proper slugs`);
}

async function assignMissingDistricts(listingsWithoutDistrict: any[]) {
  console.log('\n=== ASSIGNING DISTRICTS TO LISTINGS ===\n');
  
  if (listingsWithoutDistrict.length === 0) {
    console.log('No listings without districts to fix');
    return;
  }
  
  // Get all districts for assignment
  const districts = await prisma.district.findMany();
  
  if (districts.length === 0) {
    console.log('❌ No districts available in the database to assign');
    
    // Create default districts if none exist
    const defaultDistrictId = await ensureDefaultDistrictExists();
    if (defaultDistrictId) {
      console.log(`Created default district with ID: ${defaultDistrictId}`);
      await assignAllListingsToDistrict(listingsWithoutDistrict, defaultDistrictId);
    }
    return;
  }
  
  console.log(`Found ${districts.length} districts available for assignment`);
  console.log(`${listingsWithoutDistrict.length} listings need district assignment`);
  
  // Find the most common district to use as default
  const defaultDistrict = districts[0];
  
  // Assign all listings to default district
  await assignAllListingsToDistrict(listingsWithoutDistrict, defaultDistrict.id);
}

async function ensureDefaultDistrictExists() {
  // Create a default district if none exist
  const defaultDistrictData = defaultDistricts[0];
  
  const district = await prisma.district.create({
    data: {
      name: defaultDistrictData.name,
      slug: defaultDistrictData.slug
    }
  });
  
  console.log(`Created default district: ${district.name} (${district.id})`);
  return district.id;
}

async function assignAllListingsToDistrict(listings: any[], districtId: string) {
  let assignedCount = 0;
  
  for (const listing of listings) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { districtId }
    });
    assignedCount++;
  }
  
  console.log(`✅ Assigned ${assignedCount} listings to district ID: ${districtId}`);
}

async function showDistrictStats() {
  console.log('\n=== DISTRICT STATISTICS ===\n');
  
  // Get districts with listing counts
  const districts = await prisma.district.findMany({
    include: {
      _count: {
        select: { listings: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  console.log('District listing counts:');
  console.log('------------------------');
  districts.forEach(district => {
    console.log(`${district.name} (${district.slug}): ${district._count.listings} listings`);
  });
  
  // Get total listings count
  const totalListings = await prisma.listing.count();
  const listingsWithDistrict = await prisma.listing.count({
    where: { districtId: { not: null } }
  });
  
  console.log('\nSummary:');
  console.log('--------');
  console.log(`Total listings: ${totalListings}`);
  console.log(`Listings with district: ${listingsWithDistrict} (${Math.round(listingsWithDistrict / totalListings * 100)}%)`);
  console.log(`Listings without district: ${totalListings - listingsWithDistrict} (${Math.round((totalListings - listingsWithDistrict) / totalListings * 100)}%)`);
}

async function main() {
  try {
    console.log('Starting district management...');
    
    // Check district data integrity
    const { invalidDistricts, listingsWithoutDistrict } = await checkDistrictIntegrity();
    
    // Fix invalid district slugs
    if (invalidDistricts.length > 0) {
      await fixDistrictSlugs(invalidDistricts);
    }
    
    // Assign districts to listings without a district
    if (listingsWithoutDistrict.length > 0) {
      await assignMissingDistricts(listingsWithoutDistrict);
    }
    
    // Show district stats
    await showDistrictStats();
    
  } catch (error) {
    console.error('Error in district management:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(console.error)
  .finally(() => console.log('\nDistrict management complete')); 