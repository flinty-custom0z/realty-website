#!/usr/bin/env ts-node
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { SearchEngineService } from '../src/lib/services/SearchEngineService';

async function main() {
  console.log('Fetching active listings...');
  const listings = await prisma.listing.findMany({
    where: { status: 'active' },
    select: { id: true },
  });

  console.log(`Found ${listings.length} active listings. Notifying search engines...`);
  let success = 0;
  for (const { id } of listings) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await SearchEngineService.notifySearchEngines(id);
      success += 1;
      console.log(`✔ Notified for listing ${id}`);
    } catch (err) {
      console.error(`✖ Failed for listing ${id}`, err);
    }
  }
  console.log(`Done. Successfully notified for ${success}/${listings.length} listings.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 