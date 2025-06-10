#!/bin/bash

# Full restoration script for realty website
# Usage: ./restore.sh /path/to/backup/directory

if [ -z "$1" ]; then
  echo "Error: Backup directory path is required"
  echo "Usage: ./restore.sh /path/to/backup/directory"
  exit 1
fi

BACKUP_DIR="$1"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="restore_$TIMESTAMP.log"

echo "Starting restoration from: $BACKUP_DIR" | tee -a "$LOG_FILE"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Error: Backup directory does not exist: $BACKUP_DIR" | tee -a "$LOG_FILE"
  exit 1
fi

# Find the SQL backup file
SQL_BACKUP=$(find "$BACKUP_DIR" -name "*.sql" | sort | tail -n 1)
if [ -z "$SQL_BACKUP" ]; then
  echo "Error: No SQL backup file found in $BACKUP_DIR" | tee -a "$LOG_FILE"
  exit 1
fi

# Find the image manifest file
MANIFEST_FILE=$(find "$BACKUP_DIR" -name "manifest.json" | sort | tail -n 1)
if [ -z "$MANIFEST_FILE" ]; then
  echo "Warning: No image manifest file found in $BACKUP_DIR" | tee -a "$LOG_FILE"
fi

# 1. Restore database
echo "Restoring database from: $SQL_BACKUP" | tee -a "$LOG_FILE"
source .env

# Check if DATABASE_URL exists
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not found in .env file" | tee -a "$LOG_FILE"
  exit 1
fi

# Create a backup of the current database before restoration
echo "Creating backup of current database before restoration..." | tee -a "$LOG_FILE"
pg_dump "$DATABASE_URL" > "pre_restore_backup_$TIMESTAMP.sql"

# Restore the database
echo "Dropping and recreating database..." | tee -a "$LOG_FILE"
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

# Extract connection details without the database name
CONNECTION_STRING=$(echo "$DATABASE_URL" | sed "s/$DB_NAME//")

# Drop and recreate the database
psql "${CONNECTION_STRING}postgres" -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>> "$LOG_FILE"
psql "${CONNECTION_STRING}postgres" -c "CREATE DATABASE $DB_NAME;" 2>> "$LOG_FILE"

# Restore from backup
echo "Restoring database content..." | tee -a "$LOG_FILE"
psql "$DATABASE_URL" < "$SQL_BACKUP" 2>> "$LOG_FILE"

# 2. Restore images if manifest exists
if [ ! -z "$MANIFEST_FILE" ]; then
  echo "Restoring images using manifest: $MANIFEST_FILE" | tee -a "$LOG_FILE"
  
  # Create a Node.js script for image restoration
  cat > restore_images.js << 'EOL'
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');

const prisma = new PrismaClient();

async function restoreImages(manifestPath, backupDir) {
  try {
    console.log('Starting image restoration...');
    
    // Read the manifest file
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`Found ${manifest.images.length} images to restore`);
    
    // Process each image
    for (let i = 0; i < manifest.images.length; i++) {
      const image = manifest.images[i];
      const imagePath = path.join(backupDir, image.backupFilename);
      
      // Check if the image file exists
      if (!fs.existsSync(imagePath)) {
        console.log(`Image file not found: ${imagePath}`);
        continue;
      }
      
      console.log(`[${i+1}/${manifest.images.length}] Restoring ${image.backupFilename}`);
      
      try {
        // Read the image file
        const fileBuffer = fs.readFileSync(imagePath);
        
        // Determine the subdirectory based on the original path
        let subdirectory = '';
        if (image.originalPath.includes('/realtors/')) {
          subdirectory = 'realtors';
        }
        
        // Upload to Vercel Blob
        const blobFilename = subdirectory 
          ? `${subdirectory}/${image.backupFilename}` 
          : image.backupFilename;
          
        const { url } = await put(blobFilename, fileBuffer, { access: 'public' });
        
        // Update the database record if the URL changed
        if (url !== image.originalPath) {
          await prisma.image.update({
            where: { id: image.id },
            data: { path: url }
          });
          console.log(`Updated image path in database: ${image.id}`);
        }
        
      } catch (err) {
        console.error(`Failed to restore ${image.backupFilename}: ${err.message}`);
      }
    }
    
    console.log('Image restoration complete!');
  } catch (error) {
    console.error('Restoration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get arguments from command line
const manifestPath = process.argv[2];
const backupDir = process.argv[3];

if (!manifestPath || !backupDir) {
  console.error('Usage: node restore_images.js <manifest_path> <backup_dir>');
  process.exit(1);
}

restoreImages(manifestPath, backupDir);
EOL

  # Run the image restoration script
  echo "Executing image restoration script..." | tee -a "$LOG_FILE"
  node restore_images.js "$MANIFEST_FILE" "$BACKUP_DIR" 2>> "$LOG_FILE"
  
  # Clean up the temporary script
  rm restore_images.js
else
  echo "Skipping image restoration - no manifest file found" | tee -a "$LOG_FILE"
fi

# 3. Run Prisma migrations to ensure schema is up to date
echo "Running Prisma migrations to ensure schema is up to date..." | tee -a "$LOG_FILE"
npx prisma migrate deploy 2>> "$LOG_FILE"

echo "Restoration completed successfully!" | tee -a "$LOG_FILE"
echo "Restoration log saved to: $LOG_FILE"