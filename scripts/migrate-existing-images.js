#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const prisma = new PrismaClient();

// Define thumbnail sizes to generate (same as ImageService)
const THUMBNAIL_SIZES = [
  { width: 200, height: 200, suffix: 'thumb' },  // Small thumbnail for listings grid
  { width: 600, height: undefined, suffix: 'medium' }, // Medium size for gallery previews
  { width: 1200, height: undefined, suffix: 'large' }, // Large size for full-screen views
];

// Helper function to ensure upload directory exists
async function ensureUploadDirectory(subdirectory = '') {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdirectory);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Created directory: ${uploadDir}`);
  }
  return uploadDir;
}

// Generate thumbnails for an image
async function generateThumbnails(imagePath, filename, uploadDir) {
  const filenameWithoutExt = path.parse(filename).name;
  const generatedThumbnails = [];

  try {
    const sharpInstance = sharp(imagePath);
    
    // Generate and save thumbnails
    for (const size of THUMBNAIL_SIZES) {
      try {
        const thumbnailFilename = `${filenameWithoutExt}-${size.suffix}.webp`;
        const thumbnailPath = path.join(uploadDir, thumbnailFilename);
        
        const resizeOptions = {
          width: size.width,
          height: size.height,
          fit: 'inside',
          withoutEnlargement: true,
        };
        
        await sharpInstance
          .clone()
          .resize(resizeOptions)
          .webp({ quality: 80 })
          .toFile(thumbnailPath);
          
        generatedThumbnails.push(thumbnailFilename);
        console.log(`   📸 Generated thumbnail: ${thumbnailFilename}`);
      } catch (thumbError) {
        console.error(`   ❌ Failed to generate ${size.suffix} thumbnail:`, thumbError.message);
      }
    }
  } catch (error) {
    console.error(`   ❌ Error processing image for thumbnails:`, error.message);
  }

  return generatedThumbnails;
}

// Process a single image file
async function processImage(sourcePath, filename, subdirectory = 'listings') {
  try {
    console.log(`🔄 Processing: ${filename}`);
    
    // Ensure upload directory exists
    const uploadDir = await ensureUploadDirectory(subdirectory);
    const targetPath = path.join(uploadDir, filename);
    
    // Copy original image to uploads directory
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`   ✅ Copied to: /uploads/${subdirectory}/${filename}`);
    
    // Generate thumbnails
    const thumbnails = await generateThumbnails(targetPath, filename, uploadDir);
    
    // Create the public URL path
    const publicUrl = `/uploads/${subdirectory}/${filename}`;
    
    return {
      success: true,
      filename,
      publicUrl,
      thumbnails
    };
    
  } catch (error) {
    console.error(`   ❌ Failed to process ${filename}:`, error.message);
    return {
      success: false,
      filename,
      error: error.message
    };
  }
}

// Update database records for migrated images
async function updateDatabaseRecords(sourceDir, subdirectory = 'listings') {
  console.log('\n📊 Updating database records...');
  
  try {
    // Find all images in the database that might need updating
    const images = await prisma.image.findMany();
    console.log(`Found ${images.length} image records in database`);
    
    let updated = 0;
    let notFound = 0;
    
    for (const image of images) {
      try {
        // Extract filename from current path
        let filename;
        if (image.path.includes('blob.vercel-storage.com')) {
          // Extract from Vercel Blob URL
          const url = new URL(image.path);
          const pathParts = url.pathname.split('/');
          filename = pathParts[pathParts.length - 1];
        } else if (image.path.startsWith('/uploads/')) {
          // Already migrated
          continue;
        } else {
          // Try to extract filename from path
          const pathParts = image.path.split('/');
          filename = pathParts[pathParts.length - 1];
        }
        
        if (!filename) {
          console.log(`   ⚠️  Could not extract filename from: ${image.path}`);
          notFound++;
          continue;
        }
        
        // Check if the image file exists in uploads directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdirectory);
        const imagePath = path.join(uploadDir, filename);
        
        if (fs.existsSync(imagePath)) {
          // Update database record with new local path
          const newPath = `/uploads/${subdirectory}/${filename}`;
          await prisma.image.update({
            where: { id: image.id },
            data: { path: newPath }
          });
          
          console.log(`   ✅ Updated: ${image.id} -> ${newPath}`);
          updated++;
        } else {
          console.log(`   ⚠️  Image file not found: ${filename}`);
          notFound++;
        }
        
      } catch (error) {
        console.error(`   ❌ Failed to update image ${image.id}:`, error.message);
        notFound++;
      }
    }
    
    console.log(`\n📊 Database update summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found/skipped: ${notFound}`);
    
  } catch (error) {
    console.error('❌ Database update failed:', error);
    throw error;
  }
}

// Main migration function
async function migrateImages(sourceDir, subdirectory = 'listings') {
  console.log(`🚀 Starting image migration from: ${sourceDir}`);
  console.log(`📁 Target subdirectory: ${subdirectory}`);
  
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }
  
  // Get all image files from source directory
  const files = fs.readdirSync(sourceDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext);
  });
  
  console.log(`📷 Found ${files.length} image files to migrate`);
  
  if (files.length === 0) {
    console.log('⚠️  No image files found in source directory');
    return;
  }
  
  let processed = 0;
  let errors = 0;
  
  // Process each image
  for (const filename of files) {
    const sourcePath = path.join(sourceDir, filename);
    const result = await processImage(sourcePath, filename, subdirectory);
    
    if (result.success) {
      processed++;
    } else {
      errors++;
    }
  }
  
  console.log(`\n📊 Migration summary:`);
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📋 Total: ${files.length}`);
  
  // Update database records
  await updateDatabaseRecords(sourceDir, subdirectory);
}

// Show usage information
function showUsage() {
  console.log('📋 Usage: node scripts/migrate-existing-images.js <source-directory> [subdirectory]');
  console.log('');
  console.log('Arguments:');
  console.log('  source-directory  Path to directory containing your existing images');
  console.log('  subdirectory      Target subdirectory (listings or realtors, default: listings)');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/migrate-existing-images.js ./path/to/your/images');
  console.log('  node scripts/migrate-existing-images.js ./path/to/your/images listings');
  console.log('  node scripts/migrate-existing-images.js ./path/to/realtor/photos realtors');
  console.log('');
  console.log('This script will:');
  console.log('1. Copy all images from source directory to /public/uploads/[subdirectory]/');
  console.log('2. Generate missing thumbnails (thumb, medium, large) for each image');
  console.log('3. Update database records to point to new local paths');
  console.log('');
  console.log('⚠️  Make sure to backup your database before running this script!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const sourceDir = args[0];
const subdirectory = args[1] || 'listings';

// Check if help is requested
if (!sourceDir || process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the migration
migrateImages(sourceDir, subdirectory)
  .then(() => {
    console.log('✅ Migration completed successfully!');
    console.log('\n🎯 Next steps:');
    console.log('1. Test your application to ensure images display correctly');
    console.log('2. Verify that thumbnails are being used properly');
    console.log('3. Test image upload functionality');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  }); 