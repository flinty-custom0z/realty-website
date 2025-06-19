#!/usr/bin/env node

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { mkdir } = require('fs/promises');

const prisma = new PrismaClient();

// Configuration
const BACKUP_BASE_DIR = path.join(__dirname, '..', 'backups');
const SQL_BACKUP_DIR = path.join(__dirname, '..', 'sql_backup');

// Generate timestamp for backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupDir = path.join(BACKUP_BASE_DIR, `backup_${timestamp}`);
const imageBackupDir = path.join(backupDir, 'images');

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

async function backupDatabase() {
  console.log('🔄 Creating database backup...');
  
  try {
    // Get database URL from environment
    require('dotenv').config();
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }

    // Extract connection details from DATABASE_URL
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.slice(1); // Remove leading slash
    const username = url.username;
    const password = url.password;

    // Set PGPASSWORD environment variable for pg_dump
    process.env.PGPASSWORD = password;

    // Create pg_dump command
    const pgDumpCommand = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --no-password --verbose --clean --if-exists --create`;

    const backupFile = path.join(backupDir, `database_${timestamp}.sql`);
    console.log(`📦 Backing up database to: ${backupFile}`);
    
    // Execute pg_dump and save to file
    const backupData = execSync(pgDumpCommand, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Write backup to file
    fs.writeFileSync(backupFile, backupData);
    
    // Also save to SQL backup directory for compatibility
    const sqlBackupFile = path.join(SQL_BACKUP_DIR, `auto_backup_${timestamp}.sql`);
    fs.writeFileSync(sqlBackupFile, backupData);
    
    console.log(`✅ Database backup completed successfully!`);
    return backupFile;
    
  } catch (error) {
    console.error('❌ Database backup failed:', error.message);
    throw error;
  }
}

async function backupImages() {
  console.log('📸 Starting image backup...');
  
  try {
    // Create image backup directory
    await mkdir(imageBackupDir, { recursive: true });
    
    // Get all image records from database
    const images = await prisma.image.findMany({
      include: { listing: true }
    });
    
    console.log(`Found ${images.length} images to backup`);
    
    // Create a manifest file
    const manifest = {
      backupDate: new Date().toISOString(),
      timestamp: timestamp,
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
      const outputPath = path.join(imageBackupDir, filename);
      
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
    const manifestPath = path.join(backupDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`✅ Image backup complete! ${manifest.images.length} images saved`);
    return { manifestPath, imageCount: manifest.images.length };
    
  } catch (error) {
    console.error('❌ Image backup failed:', error.message);
    throw error;
  }
}

async function cleanupOldBackups() {
  console.log('🧹 Cleaning up old backups...');
  
  try {
    // Clean up old SQL backups (keep only last 10)
    if (fs.existsSync(SQL_BACKUP_DIR)) {
      const backupFiles = fs.readdirSync(SQL_BACKUP_DIR)
        .filter(file => file.startsWith('auto_backup_') && file.endsWith('.sql'))
        .map(file => ({
          name: file,
          path: path.join(SQL_BACKUP_DIR, file),
          time: fs.statSync(path.join(SQL_BACKUP_DIR, file)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      if (backupFiles.length > 10) {
        const filesToDelete = backupFiles.slice(10);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`🗑️  Removed old SQL backup: ${file.name}`);
        });
      }
    }
    
    // Clean up old full backups (keep only last 5)
    if (fs.existsSync(BACKUP_BASE_DIR)) {
      const fullBackups = fs.readdirSync(BACKUP_BASE_DIR)
        .filter(dir => dir.startsWith('backup_') && fs.statSync(path.join(BACKUP_BASE_DIR, dir)).isDirectory())
        .map(dir => ({
          name: dir,
          path: path.join(BACKUP_BASE_DIR, dir),
          time: fs.statSync(path.join(BACKUP_BASE_DIR, dir)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      if (fullBackups.length > 5) {
        const dirsToDelete = fullBackups.slice(5);
        dirsToDelete.forEach(dir => {
          fs.rmSync(dir.path, { recursive: true, force: true });
          console.log(`🗑️  Removed old full backup: ${dir.name}`);
        });
      }
    }
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('⚠️  Cleanup failed:', error.message);
    // Don't fail the backup if cleanup fails
  }
}

async function createFullBackup() {
  console.log('🚀 Starting full backup process...');
  console.log(`📁 Backup directory: ${backupDir}`);
  
  try {
    // Create backup directories
    await mkdir(backupDir, { recursive: true });
    await mkdir(SQL_BACKUP_DIR, { recursive: true });
    
    // Backup database
    const dbBackupFile = await backupDatabase();
    
    // Backup images
    const imageResult = await backupImages();
    
    // Create backup summary
    const summary = {
      timestamp: timestamp,
      backupDate: new Date().toISOString(),
      databaseBackup: path.basename(dbBackupFile),
      imageBackup: {
        manifestFile: 'manifest.json',
        imageCount: imageResult.imageCount,
        imageDirectory: 'images'
      },
      backupDirectory: backupDir
    };
    
    fs.writeFileSync(path.join(backupDir, 'backup-summary.json'), JSON.stringify(summary, null, 2));
    
    // Clean up old backups
    await cleanupOldBackups();
    
    console.log('🎉 Full backup completed successfully!');
    console.log(`📂 Backup saved to: ${backupDir}`);
    console.log(`📊 Summary:`);
    console.log(`   - Database: ${path.basename(dbBackupFile)}`);
    console.log(`   - Images: ${imageResult.imageCount} files`);
    console.log(`   - Manifest: manifest.json`);
    
  } catch (error) {
    console.error('❌ Full backup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backup
createFullBackup(); 