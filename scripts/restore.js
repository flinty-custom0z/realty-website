#!/usr/bin/env node

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Get command line arguments
const args = process.argv.slice(2);
const backupPath = args[0];
const restoreType = args[1] || 'full'; // 'full', 'db-only', or 'images-only'

function showUsage() {
  console.log('📋 Usage: npm run restore <backup-path> [restore-type]');
  console.log('');
  console.log('Arguments:');
  console.log('  backup-path   Path to backup directory or SQL file');
  console.log('  restore-type  Type of restore: full, db-only, or images-only (default: full)');
  console.log('');
  console.log('Examples:');
  console.log('  npm run restore ./backups/backup_2025-06-14T11-51-04');
  console.log('  npm run restore ./sql_backup/auto_backup_2025-06-14T11-51-04.sql db-only');
  console.log('  npm run restore ./backups/backup_2025-06-14T11-51-04 images-only');
  console.log('');
  
  // Show available backups
  console.log('Available backups:');
  
  // Show full backups
  const backupDir = path.join(__dirname, '..', 'backups');
  if (fs.existsSync(backupDir)) {
    console.log('\nFull backups:');
    const fullBackups = fs.readdirSync(backupDir)
      .filter(dir => dir.startsWith('backup_') && fs.statSync(path.join(backupDir, dir)).isDirectory())
      .sort((a, b) => {
        const statA = fs.statSync(path.join(backupDir, a));
        const statB = fs.statSync(path.join(backupDir, b));
        return statB.mtime - statA.mtime;
      });
    
    fullBackups.forEach((backup, index) => {
      const filePath = path.join(backupDir, backup);
      const stats = fs.statSync(filePath);
      const date = stats.mtime.toLocaleString();
      console.log(`  ${index + 1}. ${backup} (${date})`);
    });
  }
  
  // Show SQL backups
  const sqlBackupDir = path.join(__dirname, '..', 'sql_backup');
  if (fs.existsSync(sqlBackupDir)) {
    console.log('\nDatabase-only backups:');
    const sqlBackups = fs.readdirSync(sqlBackupDir)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(sqlBackupDir, a));
        const statB = fs.statSync(path.join(sqlBackupDir, b));
        return statB.mtime - statA.mtime;
      });
    
    sqlBackups.slice(0, 10).forEach((backup, index) => {
      const filePath = path.join(sqlBackupDir, backup);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(1);
      const date = stats.mtime.toLocaleString();
      console.log(`  ${index + 1}. ${backup} (${size}KB, ${date})`);
    });
  }
}

async function restoreDatabase(sqlFilePath) {
  console.log('🔄 Restoring database from backup...');
  
  try {
    // Get database URL from environment
    require('dotenv').config();
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }

    // Check if backup file exists
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Backup file not found: ${sqlFilePath}`);
    }

    // Extract connection details from DATABASE_URL
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.slice(1); // Remove leading slash
    const username = url.username;
    const password = url.password;

    // Set PGPASSWORD environment variable for psql
    process.env.PGPASSWORD = password;

    console.log(`📦 Restoring from: ${sqlFilePath}`);
    console.log(`🎯 Target database: ${database} on ${host}`);
    
    // Create backup of current database before restoration
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const preRestoreBackup = path.join(path.dirname(sqlFilePath), `pre_restore_backup_${timestamp}.sql`);
    
    console.log('💾 Creating backup of current database before restoration...');
    const backupCommand = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --no-password`;
    const currentData = execSync(backupCommand, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    fs.writeFileSync(preRestoreBackup, currentData);
    console.log(`✅ Pre-restore backup saved to: ${preRestoreBackup}`);
    
    // Create psql command to restore
    const psqlCommand = `psql -h ${host} -p ${port} -U ${username} -d ${database} --no-password -f "${sqlFilePath}"`;

    console.log('⚠️  This will overwrite your current database!');
    console.log('🔄 Restoring...');
    
    // Execute psql restore
    execSync(psqlCommand, { 
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log(`✅ Database restored successfully!`);
    
    // Regenerate Prisma client after restore
    console.log('🔄 Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client regenerated!');
    
    return preRestoreBackup;
    
  } catch (error) {
    console.error('❌ Database restore failed:', error.message);
    throw error;
  }
}

async function restoreImages(backupDir) {
  console.log('📸 Restoring images from backup...');
  
  try {
    const manifestPath = path.join(backupDir, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest file not found: ${manifestPath}`);
    }
    
    // Read the manifest file
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`Found ${manifest.images.length} images to restore`);
    
    const imageDir = path.join(backupDir, 'images');
    if (!fs.existsSync(imageDir)) {
      throw new Error(`Image directory not found: ${imageDir}`);
    }
    
    // Process each image
    let restoredCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < manifest.images.length; i++) {
      const image = manifest.images[i];
      const imagePath = path.join(imageDir, image.backupFilename);
      
      // Check if the image file exists
      if (!fs.existsSync(imagePath)) {
        console.log(`Image file not found: ${imagePath}`);
        errorCount++;
        continue;
      }
      
      console.log(`[${i+1}/${manifest.images.length}] Restoring ${image.backupFilename}`);
      
      try {
        // Determine the subdirectory based on the original path
        let subdirectory = 'listings';
        if (image.originalPath.includes('/realtors/')) {
          subdirectory = 'realtors';
        }
        
        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdirectory);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Copy the image to local storage
        const targetPath = path.join(uploadDir, image.backupFilename);
        fs.copyFileSync(imagePath, targetPath);
        
        // Create the public URL path
        const publicUrl = `/uploads/${subdirectory}/${image.backupFilename}`;
        
        // Update the database record with the new local path
        await prisma.image.update({
          where: { id: image.id },
          data: { path: publicUrl }
        });
        
        console.log(`✅ Restored image: ${image.backupFilename} -> ${publicUrl}`);
        restoredCount++;
        
      } catch (error) {
        console.log(`❌ Failed to restore ${image.backupFilename}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Image restoration summary:`);
    console.log(`   ✅ Restored: ${restoredCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📋 Total: ${manifest.images.length}`);
    
  } catch (error) {
    console.error('❌ Image restoration failed:', error.message);
    throw error;
  }
}

async function performRestore() {
  if (!backupPath) {
    showUsage();
    process.exit(1);
  }
  
  console.log('🚀 Starting restore process...');
  console.log(`📁 Backup path: ${backupPath}`);
  console.log(`🔧 Restore type: ${restoreType}`);
  
  try {
    let sqlFilePath = null;
    let backupDir = null;
    let preRestoreBackup = null;
    let imageResult = null;
    
    // Determine backup type and paths
    if (fs.statSync(backupPath).isDirectory()) {
      // Full backup directory
      backupDir = backupPath;
      
      // Find SQL file in backup directory
      const possibleSqlFiles = [
        path.join(backupDir, `database_*.sql`),
        path.join(backupDir, '*.sql')
      ];
      
      // Try to find SQL files manually
      const files = fs.readdirSync(backupDir);
      const dbFile = files.find(f => f.startsWith('database_') && f.endsWith('.sql'));
      if (dbFile) {
        sqlFilePath = path.join(backupDir, dbFile);
      }
      
      if (!sqlFilePath) {
        // Try to find any .sql file in the directory
        const sqlFiles = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql'));
        if (sqlFiles.length > 0) {
          sqlFilePath = path.join(backupDir, sqlFiles[0]);
        }
      }
      
    } else if (backupPath.endsWith('.sql')) {
      // SQL backup file
      sqlFilePath = backupPath;
    } else {
      throw new Error('Invalid backup path. Must be a directory or .sql file');
    }
    
    // Restore database
    if (restoreType === 'full' || restoreType === 'db-only') {
      if (!sqlFilePath) {
        throw new Error('No SQL backup file found');
      }
      preRestoreBackup = await restoreDatabase(sqlFilePath);
    }
    
    // Restore images
    if (restoreType === 'full' || restoreType === 'images-only') {
      if (!backupDir) {
        throw new Error('Image restore requires a full backup directory');
      }
      imageResult = await restoreImages(backupDir);
    }
    
    // Run Prisma migrations to ensure schema is up to date
    if (restoreType === 'full' || restoreType === 'db-only') {
      console.log('🔄 Running Prisma migrations to ensure schema is up to date...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Prisma migrations completed');
    }
    
    console.log('🎉 Restore completed successfully!');
    console.log('📊 Summary:');
    if (preRestoreBackup) {
      console.log(`   - Pre-restore backup: ${path.basename(preRestoreBackup)}`);
    }
    if (sqlFilePath) {
      console.log(`   - Database restored from: ${path.basename(sqlFilePath)}`);
    }
    if (imageResult) {
      console.log(`   - Images: ${imageResult.restoredCount} restored, ${imageResult.errorCount} errors`);
    }
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restore
performRestore(); 