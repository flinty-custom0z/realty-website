const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function markMigrationsAsApplied() {
  try {
    // Create _prisma_migrations table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" SERIAL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMP WITH TIME ZONE,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMP WITH TIME ZONE,
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY ("id")
      );
    `;
    
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
        
        await prisma.$executeRaw`
          INSERT INTO "_prisma_migrations" (migration_name, finished_at, checksum, applied_steps_count)
          VALUES (${migration}, NOW(), 'MANUALLY_APPLIED', 1)
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
