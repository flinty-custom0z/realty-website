#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateImagePaths() {
  console.log('🔄 Starting migration from Vercel Blob to local storage...');
  
  try {
    // Find all images that still have Vercel Blob URLs
    const images = await prisma.image.findMany({
      where: {
        path: {
          contains: 'blob.vercel-storage.com'
        }
      }
    });

    console.log(`Found ${images.length} images with Vercel Blob URLs`);

    if (images.length === 0) {
      console.log('✅ No images need migration. All images are already using local storage.');
      return;
    }

    let updated = 0;
    let errors = 0;

    for (const image of images) {
      try {
        // Extract filename from Vercel Blob URL
        const url = new URL(image.path);
        const pathParts = url.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];
        
        // Determine subdirectory based on path
        let subdirectory = 'listings';
        if (image.path.includes('/realtors/')) {
          subdirectory = 'realtors';
        }

        // Create new local path
        const newPath = `/uploads/${subdirectory}/${filename}`;

        // Update the database record
        await prisma.image.update({
          where: { id: image.id },
          data: { path: newPath }
        });

        console.log(`✅ Updated: ${image.id} -> ${newPath}`);
        updated++;

      } catch (error) {
        console.error(`❌ Failed to update image ${image.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Migration complete:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Total: ${images.length}`);

    if (errors > 0) {
      console.log('\n⚠️  Some images could not be migrated. Please check the errors above.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage information
function showUsage() {
  console.log('📋 Usage: node scripts/migrate-to-local-storage.js');
  console.log('');
  console.log('This script will:');
  console.log('1. Find all images in the database that still have Vercel Blob URLs');
  console.log('2. Convert them to local storage paths (/uploads/...)');
  console.log('3. Update the database records');
  console.log('');
  console.log('⚠️  Note: This script only updates database records.');
  console.log('   Make sure your actual image files are already in the local uploads directory.');
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the migration
migrateImagePaths()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 