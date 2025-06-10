const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { mkdir } = require('fs/promises');

const prisma = new PrismaClient();
const backupDir = path.join(process.cwd(), 'image-backups', new Date().toISOString().split('T')[0]);

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function backupImages() {
  try {
    console.log('Starting image backup...');
    
    // Create backup directory
    await mkdir(backupDir, { recursive: true });
    
    // Get all image records from database
    const images = await prisma.image.findMany({
      include: { listing: true }
    });
    
    console.log(`Found ${images.length} images to backup`);
    
    // Create a manifest file
    const manifest = {
      backupDate: new Date().toISOString(),
      images: []
    };
    
    // Download each image
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const url = image.path;
      
      // Skip if not a URL
      if (!url.startsWith('http')) {
        console.log(`Skipping non-URL path: ${url}`);
        continue;
      }
      
      // Extract filename from URL or create one
      const filename = url.split('/').pop() || `${image.id}.jpg`;
      const outputPath = path.join(backupDir, filename);
      
      console.log(`[${i+1}/${images.length}] Downloading ${url}`);
      
      try {
        await downloadFile(url, outputPath);
        
        // Add to manifest
        manifest.images.push({
          id: image.id,
          listingId: image.listingId,
          listingCode: image.listing.listingCode,
          originalPath: url,
          backupFilename: filename,
          isFeatured: image.isFeatured
        });
      } catch (err) {
        console.error(`Failed to download ${url}: ${err.message}`);
      }
    }
    
    // Save manifest
    fs.writeFileSync(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`Backup complete! ${manifest.images.length} images saved to ${backupDir}`);
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupImages();