#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function cleanSqlFile(inputFile, outputFile) {
  console.log('🔄 Cleaning SQL file for VPS deployment...');
  console.log(`📂 Input: ${inputFile}`);
  console.log(`📂 Output: ${outputFile}`);
  
  if (!fs.existsSync(inputFile)) {
    throw new Error(`Input file does not exist: ${inputFile}`);
  }
  
  // Read the SQL file
  let sqlContent = fs.readFileSync(inputFile, 'utf8');
  
  console.log(`📊 Original file size: ${(sqlContent.length / 1024).toFixed(1)}KB`);
  
  // Count how many Vercel Blob URLs we find
  const blobUrlRegex = /https:\/\/[a-zA-Z0-9]+\.public\.blob\.vercel-storage\.com\/([a-zA-Z0-9-]+\.[a-zA-Z0-9]+)/g;
  const matches = [...sqlContent.matchAll(blobUrlRegex)];
  
  console.log(`🔍 Found ${matches.length} Vercel Blob URLs to replace`);
  
  if (matches.length === 0) {
    console.log('✅ No Vercel Blob URLs found. File is already clean!');
    return;
  }
  
  // Track unique filenames for logging
  const uniqueFilenames = new Set();
  
  // Replace all Vercel Blob URLs with local paths
  sqlContent = sqlContent.replace(blobUrlRegex, (match, filename) => {
    uniqueFilenames.add(filename);
    
    // Determine subdirectory based on context
    // For now, we'll default to 'listings' since most images are listing images
    // If needed, this could be made more sophisticated by analyzing the context
    return `/uploads/listings/${filename}`;
  });
  
  console.log(`📸 Converted ${uniqueFilenames.size} unique image files`);
  console.log(`🔄 Total URL replacements: ${matches.length}`);
  
  // Write the cleaned SQL file
  fs.writeFileSync(outputFile, sqlContent, 'utf8');
  
  console.log(`📊 Cleaned file size: ${(sqlContent.length / 1024).toFixed(1)}KB`);
  console.log(`✅ Cleaned SQL file saved to: ${outputFile}`);
  
  // Log some examples of what was changed
  console.log('\n📋 Sample conversions:');
  const sampleFilenames = Array.from(uniqueFilenames).slice(0, 5);
  sampleFilenames.forEach(filename => {
    console.log(`   https://...blob.vercel-storage.com/${filename}`);
    console.log(`   → /uploads/listings/${filename}`);
  });
  
  if (uniqueFilenames.size > 5) {
    console.log(`   ... and ${uniqueFilenames.size - 5} more files`);
  }
}

function showUsage() {
  console.log('📋 Usage: node scripts/clean-sql-for-vps.js <input-file> [output-file]');
  console.log('');
  console.log('Arguments:');
  console.log('  input-file   Path to SQL backup file with Vercel Blob URLs');
  console.log('  output-file  Path for cleaned SQL file (optional, defaults to input-file with _clean suffix)');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/clean-sql-for-vps.js backups/backup_ready_for_vps.sql');
  console.log('  node scripts/clean-sql-for-vps.js backup.sql backup_clean.sql');
  console.log('');
  console.log('This script will:');
  console.log('1. Find all Vercel Blob URLs in the SQL file');
  console.log('2. Replace them with local /uploads/listings/ paths');
  console.log('3. Save the cleaned SQL file for VPS deployment');
  console.log('');
  console.log('⚠️  Make sure your actual image files are uploaded to your VPS first!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const inputFile = args[0];
let outputFile = args[1];

// Check if help is requested
if (!inputFile || process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Generate output filename if not provided
if (!outputFile) {
  const parsedPath = path.parse(inputFile);
  outputFile = path.join(parsedPath.dir, `${parsedPath.name}_clean${parsedPath.ext}`);
}

// Run the cleaning
try {
  cleanSqlFile(inputFile, outputFile);
  console.log('\n🎯 Next steps:');
  console.log('1. Upload your image files to your VPS at /public/uploads/listings/');
  console.log('2. Import the cleaned SQL file to your VPS database');
  console.log('3. Test that images display correctly on your VPS');
  console.log('');
  console.log('✅ SQL file is ready for VPS deployment!');
} catch (error) {
  console.error('❌ Error cleaning SQL file:', error.message);
  process.exit(1);
} 