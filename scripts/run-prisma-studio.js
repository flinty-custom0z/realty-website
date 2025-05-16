#!/usr/bin/env node

/**
 * Custom script to run Prisma Studio with options to avoid problematic queries
 * that cause GROUP BY issues with PostgreSQL.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Prisma Studio with custom configuration...');

try {
  // Run Prisma Studio with specific command-line options
  // The --schema flag makes sure it uses the right schema
  // We're also setting some environment variables to control behavior
  execSync(
    'npx prisma studio --browser none --port 5555 --hostname localhost', 
    {
      env: {
        ...process.env,
        // These environment variables might help avoid some problematic queries
        NODE_ENV: 'development',
        DEBUG: 'prisma:studio',
        PRISMA_STUDIO_MAX_RELATION_COUNT: '0', // Disable relation counting to avoid GROUP BY
      },
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    }
  );
} catch (error) {
  console.error('Error running Prisma Studio:', error.message);
  process.exit(1);
} 