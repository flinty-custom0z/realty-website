#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const backupFile = args[0];

if (!backupFile) {
  console.log('📋 Usage: npm run restore-db <backup-file>');
  console.log('');
  console.log('Available backups:');
  
  const backupDir = path.join(__dirname, '..', 'sql_backup');
  if (fs.existsSync(backupDir)) {
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(backupDir, a));
        const statB = fs.statSync(path.join(backupDir, b));
        return statB.mtime - statA.mtime;
      });
    
    backups.forEach((backup, index) => {
      const filePath = path.join(backupDir, backup);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(1);
      const date = stats.mtime.toLocaleString();
      console.log(`  ${index + 1}. ${backup} (${size}KB, ${date})`);
    });
  }
  
  console.log('');
  console.log('Example: npm run restore-db auto_backup_2025-06-14T11-51-04.sql');
  process.exit(1);
}

console.log('🔄 Restoring database from backup...');

try {
  // Get database URL from environment
  require('dotenv').config();
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  // Check if backup file exists
  const backupDir = path.join(__dirname, '..', 'sql_backup');
  const fullBackupPath = path.isAbsolute(backupFile) 
    ? backupFile 
    : path.join(backupDir, backupFile);
    
  if (!fs.existsSync(fullBackupPath)) {
    console.error(`❌ Backup file not found: ${fullBackupPath}`);
    process.exit(1);
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

  console.log(`📦 Restoring from: ${fullBackupPath}`);
  console.log(`🎯 Target database: ${database} on ${host}`);
  
  // Create psql command to restore
  const psqlCommand = `psql -h ${host} -p ${port} -U ${username} -d ${database} --no-password -f "${fullBackupPath}"`;

  console.log('⚠️  This will overwrite your current database!');
  console.log('🔄 Restoring...');
  
  // Execute psql restore
  execSync(psqlCommand, { 
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  console.log(`✅ Database restored successfully from ${backupFile}!`);
  console.log('🔄 Regenerating Prisma client...');
  
  // Regenerate Prisma client after restore
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Prisma client regenerated!');
  console.log('🎉 Database restore completed successfully!');

} catch (error) {
  console.error('❌ Database restore failed:', error.message);
  process.exit(1);
} 