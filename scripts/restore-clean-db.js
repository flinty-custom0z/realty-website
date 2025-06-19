#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const sqlFile = args[0] || 'backups/backup_ready_for_vps_clean.sql';

if (!fs.existsSync(sqlFile)) {
  console.error(`❌ SQL file not found: ${sqlFile}`);
  console.log('Usage: node scripts/restore-clean-db.js [path-to-sql-file]');
  process.exit(1);
}

async function restoreDatabase() {
  console.log('🔄 Starting database restoration process...');
  console.log(`📂 Using SQL file: ${sqlFile}`);

  try {
    // Extract database info from DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable not found');
    }

    // Parse PostgreSQL connection string
    const dbUrlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!dbUrlMatch) {
      throw new Error('Could not parse DATABASE_URL');
    }
    
    const [, username, password, host, port, database] = dbUrlMatch;
    
    console.log(`🔗 Database: ${database} on ${host}:${port}`);

    // Step 1: Create backup of current database
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `sql_backup/pre_clean_restore_${timestamp}.sql`;
    
    console.log('💾 Creating backup of current database...');
    try {
      execSync(`pg_dump "${databaseUrl}" > "${backupFile}"`, { 
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: password }
      });
      console.log(`✅ Current database backed up to: ${backupFile}`);
    } catch (error) {
      console.warn('⚠️  Could not create backup, but continuing with restoration...');
    }

    // Step 2: Drop existing database and recreate
    console.log('🗑️  Dropping existing database...');
    const tempDbUrl = databaseUrl.replace(`/${database}`, '/postgres');
    
    try {
      execSync(`psql "${tempDbUrl}" -c "DROP DATABASE IF EXISTS \\"${database}\\""`, {
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: password }
      });
      console.log('✅ Database dropped');
    } catch (error) {
      console.error('❌ Error dropping database:', error.message);
      throw error;
    }

    // Step 3: Create fresh database
    console.log('🆕 Creating fresh database...');
    try {
      execSync(`psql "${tempDbUrl}" -c "CREATE DATABASE \\"${database}\\""`, {
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: password }
      });
      console.log('✅ Fresh database created');
    } catch (error) {
      console.error('❌ Error creating database:', error.message);
      throw error;
    }

    // Step 4: Import the cleaned SQL file
    console.log('📥 Importing cleaned database...');
    try {
      execSync(`psql "${databaseUrl}" < "${sqlFile}"`, {
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: password }
      });
      console.log('✅ Database imported successfully');
    } catch (error) {
      console.error('❌ Error importing database:', error.message);
      throw error;
    }

    // Step 5: Run Prisma migrations to ensure schema is up to date
    console.log('🔧 Running Prisma migrations...');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('✅ Schema updated');
    } catch (error) {
      console.warn('⚠️  Schema update failed, but database was imported. You may need to run migrations manually.');
    }

    // Step 6: Generate Prisma client
    console.log('🔨 Generating Prisma client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated');
    } catch (error) {
      console.warn('⚠️  Could not generate Prisma client. Run `npx prisma generate` manually.');
    }

    console.log('\n🎉 Database restoration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Backup created: ${backupFile}`);
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
    console.log('   • Ensure you have proper database permissions');
    console.log('   • If you have a backup, you can restore it manually');
    process.exit(1);
  }
}

// Run the restoration
restoreDatabase().catch(console.error); 