#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const sqlFile = args[0] || 'backups/backup_ready_for_vps_clean.sql';

if (!fs.existsSync(sqlFile)) {
  console.error(`❌ SQL file not found: ${sqlFile}`);
  console.log('Usage: node scripts/restore-clean-db-simple.js [path-to-sql-file]');
  process.exit(1);
}

async function restoreDatabaseSimple() {
  console.log('🔄 Starting simple database restoration process...');
  console.log(`📂 Using SQL file: ${sqlFile}`);

  try {
    // Get the database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable not found');
      console.error('Please make sure your .env file contains DATABASE_URL');
      process.exit(1);
    }

    console.log(`🔗 Database URL configured`);

    // Step 1: Create backup of current database (optional)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `sql_backup/pre_simple_restore_${timestamp}.sql`;
    
    console.log('💾 Creating backup of current database...');
    try {
      execSync(`pg_dump "${databaseUrl}" > "${backupFile}"`, { 
        stdio: 'pipe'
      });
      console.log(`✅ Current database backed up to: ${backupFile}`);
    } catch (error) {
      console.warn('⚠️  Could not create backup, but continuing with restoration...');
    }

    // Step 2: Clear existing data using Prisma
    console.log('🧹 Clearing existing database data...');
    try {
      execSync('npx prisma db push --force-reset --accept-data-loss', { 
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: databaseUrl }
      });
      console.log('✅ Database cleared');
    } catch (error) {
      console.error('❌ Error clearing database:', error.message);
      throw error;
    }

    // Step 3: Import the cleaned SQL file
    console.log('📥 Importing cleaned database...');
    try {
      execSync(`psql "${databaseUrl}" < "${sqlFile}"`, {
        stdio: 'pipe'
      });
      console.log('✅ Database imported successfully');
    } catch (error) {
      console.error('❌ Error importing database:', error.message);
      console.error('This might be due to schema differences. Trying alternative approach...');
      
      // Alternative: Let's try using Prisma to handle this
      try {
        console.log('🔄 Trying to sync schema first...');
        execSync('npx prisma db push --accept-data-loss', { 
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: databaseUrl }
        });
        
        console.log('🔄 Retrying data import...');
        execSync(`psql "${databaseUrl}" < "${sqlFile}"`, {
          stdio: 'pipe'
        });
        console.log('✅ Database imported successfully (second attempt)');
      } catch (error2) {
        console.error('❌ Import failed. You may need to manually import the data.');
        throw error2;
      }
    }

    // Step 4: Generate Prisma client
    console.log('🔨 Generating Prisma client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated');
    } catch (error) {
      console.warn('⚠️  Could not generate Prisma client. Run `npx prisma generate` manually.');
    }

    console.log('\n🎉 Database restoration completed successfully!');
    console.log('\n📊 Summary:');
    if (fs.existsSync(backupFile)) {
      console.log(`   • Backup created: ${backupFile}`);
    }
    console.log(`   • Database restored from: ${sqlFile}`);
    console.log('   • All Vercel Blob URLs converted to local paths');
    console.log('   • Schema is up to date');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Run your application: npm run dev');
    console.log('   2. Upload your images using: npm run migrate-images /path/to/images');
    console.log('   3. Test that everything works correctly');

  } catch (error) {
    console.error('\n❌ Database restoration failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Make sure PostgreSQL is running');
    console.log('   • Check your DATABASE_URL environment variable');
    console.log('   • Try running: npx prisma db push --force-reset');
    console.log('   • Then manually import with: psql $DATABASE_URL < backups/backup_ready_for_vps_clean.sql');
    process.exit(1);
  }
}

// Load environment variables from .env file
require('dotenv').config();

// Run the restoration
restoreDatabaseSimple().catch(console.error); 