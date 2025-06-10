const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function markMigrationsAsApplied() {
  try {
    // Get all migration directories
    const migrationsDir = path.join(__dirname, 'prisma/migrations');
    const migrations = fs.readdirSync(migrationsDir)
      .filter(dir => !dir.startsWith('.') && fs.statSync(path.join(migrationsDir, dir)).isDirectory());
    
    console.log(`Found ${migrations.length} migrations to mark as applied`);
    
    // Check which migrations are already applied
    const appliedMigrations = await prisma.$queryRaw`
      SELECT migration_name FROM "_prisma_migrations"
    `;
    
    const appliedNames = new Set(appliedMigrations.map(m => m.migration_name));
    
    // Mark each migration as applied if not already applied
    for (const migration of migrations) {
      if (!appliedNames.has(migration)) {
        console.log(`Marking migration ${migration} as applied`);
        
        // Generate a checksum for the migration
        const checksum = crypto.createHash('sha256').update(migration).digest('hex');
        
        // Use Prisma's $queryRaw to handle proper escaping
        await prisma.$queryRaw`
          INSERT INTO "_prisma_migrations" 
          (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count) 
          VALUES 
          (DEFAULT, ${checksum}, NOW(), ${migration}, NULL, NOW(), 1)
        `;
      } else {
        console.log(`Migration ${migration} is already applied`);
      }
    }
    
    console.log('All migrations marked as applied!');
  } catch (error) {
    console.error('Error marking migrations as applied:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markMigrationsAsApplied();
