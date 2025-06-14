#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '..', 'sql_backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate timestamp for backup filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFile = path.join(backupDir, `auto_backup_${timestamp}.sql`);

console.log('🔄 Creating automatic database backup...');

try {
  // Get database URL from environment
  require('dotenv').config();
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
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

  console.log(`📦 Backing up database to: ${backupFile}`);
  
  // Execute pg_dump and save to file
  const backupData = execSync(pgDumpCommand, { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Write backup to file
  fs.writeFileSync(backupFile, backupData);
  
  console.log(`✅ Database backup completed successfully!`);
  console.log(`📁 Backup saved to: ${backupFile}`);
  
  // Clean up old backups (keep only last 10)
  const backupFiles = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('auto_backup_') && file.endsWith('.sql'))
    .map(file => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).mtime
    }))
    .sort((a, b) => b.time - a.time);

  if (backupFiles.length > 10) {
    const filesToDelete = backupFiles.slice(10);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️  Removed old backup: ${file.name}`);
    });
  }

} catch (error) {
  console.error('❌ Database backup failed:', error.message);
  
  // Don't fail the build if backup fails, just warn
  console.warn('⚠️  Build will continue despite backup failure');
  process.exit(0);
} 