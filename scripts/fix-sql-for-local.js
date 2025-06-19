#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixSqlForLocal(inputFile, outputFile) {
  console.log('🔧 Fixing SQL file for local PostgreSQL...');
  console.log(`📂 Input: ${inputFile}`);
  console.log(`📂 Output: ${outputFile}`);
  
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file does not exist: ${inputFile}`);
  }
  
  // Read the SQL file
  let sqlContent = fs.readFileSync(inputFile, 'utf8');
  
  console.log(`📊 Original file size: ${(sqlContent.length / 1024).toFixed(1)}KB`);
  
  // List of problematic configuration parameters to remove/comment out
  const problematicSettings = [
    'SET transaction_timeout = 0;',
    'SET idle_in_transaction_session_timeout = 0;',
    'GRANT ALL ON SCHEMA public TO cloud_admin;',
    'GRANT ALL ON SCHEMA public TO postgres;',
    'GRANT CREATE ON SCHEMA public TO PUBLIC;'
  ];
  
  let fixCount = 0;
  
  // Remove or comment out problematic settings
  problematicSettings.forEach(setting => {
    if (sqlContent.includes(setting)) {
      console.log(`🔧 Removing: ${setting}`);
      sqlContent = sqlContent.replace(new RegExp(setting.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `-- ${setting} (removed for local compatibility)`);
      fixCount++;
    }
  });
  
  // Remove any references to cloud_admin role
  sqlContent = sqlContent.replace(/GRANT.*cloud_admin.*;/g, '-- $& (removed for local compatibility)');
  
  // Remove owner assignments that might cause issues
  sqlContent = sqlContent.replace(/ALTER .* OWNER TO .*;/g, '-- $& (removed for local compatibility)');
  
  // Remove schema owner changes
  sqlContent = sqlContent.replace(/ALTER SCHEMA .* OWNER TO .*;/g, '-- $& (removed for local compatibility)');
  
  console.log(`✅ Fixed ${fixCount} problematic settings`);
  console.log(`📊 Processed file size: ${(sqlContent.length / 1024).toFixed(1)}KB`);
  
  // Write the cleaned file
  fs.writeFileSync(outputFile, sqlContent);
  
  console.log(`✅ Local-compatible SQL file created: ${outputFile}`);
  console.log('\n🚀 You can now import with:');
  console.log(`   psql "postgresql://test_user:test_password@localhost:5432/oporadom_test" < "${outputFile}"`);
}

// Get command line arguments
const args = process.argv.slice(2);
const inputFile = args[0] || 'backups/backup_ready_for_vps_clean.sql';
const outputFile = args[1] || inputFile.replace('.sql', '_local.sql');

try {
  fixSqlForLocal(inputFile, outputFile);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 