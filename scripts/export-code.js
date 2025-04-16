/**
 * Script to export code files from a project into a single file for AI analysis
 * Skips build artifacts, images, and sensitive files
 * 
 * Usage: node export-code.js
 */

const fs = require('fs');
const path = require('path');

// Create exports folder if it doesn't exist
const exportDir = path.join(process.cwd(), 'exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

// Generate timestamped filename
const now = new Date();
const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+/, ''); // e.g., 20250416T153012
const formattedTimestamp = `${timestamp.slice(0, 8)}-${timestamp.slice(9, 15)}`; // e.g., 20250416-153012
const outputFile = path.join(exportDir, `project-code-export-${formattedTimestamp}.md`);

// Extensions to include
const CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', 
  '.prisma', '.graphql', '.sql', '.html', '.yml', '.yaml'
];

// Directories to skip
const SKIP_DIRECTORIES = [
  'node_modules', '.next', '.git', 'public/images', 
  'dist', 'build', 'coverage', '.cache', 'exports'
];

// Files to skip
const SKIP_FILES = [
  '.env', '.env.local', '.env.development', '.env.production',
  '.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.gitignore', '.eslintcache', 'README.md', 'LICENSE'
];

// File size limit (to avoid huge binary files) - 500KB
const MAX_FILE_SIZE = 500 * 1024;

// Initialize output stream
fs.writeFileSync(outputFile, `# Project Code Export\n\nGenerated: ${new Date().toISOString()}\n\n`);

// Function to walk directories recursively
function walkDirectory(dir, rootDir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(rootDir, filePath);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Skip directories in the exclude list
      if (SKIP_DIRECTORIES.some(skipDir => relativePath.includes(skipDir))) {
        return;
      }
      
      // Recursively walk subdirectories
      walkDirectory(filePath, rootDir);
    } else if (stats.isFile()) {
      // Skip files in the exclude list
      if (SKIP_FILES.includes(file)) {
        return;
      }
      
      // Skip files that don't have a recognized code extension
      const ext = path.extname(file).toLowerCase();
      if (!CODE_EXTENSIONS.includes(ext)) {
        return;
      }
      
      // Skip files that are too large
      if (stats.size > MAX_FILE_SIZE) {
        appendToOutput(`\n\n# File: ${relativePath}\n\n[SKIPPED - FILE TOO LARGE: ${Math.round(stats.size / 1024)}KB]\n`);
        return;
      }
      
      try {
        // Read file content and add to output with file header
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Create a standardized header for the file
        const header = `\n\n${'='.repeat(80)}\n# File: ${relativePath}\n${'='.repeat(80)}\n\n`;
        
        // Append to output file
        appendToOutput(header + content);
        
        console.log(`Added: ${relativePath}`);
      } catch (error) {
        console.error(`Error reading ${relativePath}: ${error.message}`);
        appendToOutput(`\n\n# File: ${relativePath}\n\n[ERROR READING FILE: ${error.message}]\n`);
      }
    }
  });
}

// Helper function to append to the output file
function appendToOutput(content) {
  fs.appendFileSync(outputFile, content);
}

// Start the export process
console.log(`Starting export to ${outputFile}...`);
try {
  walkDirectory(process.cwd(), process.cwd());
  console.log(`\nExport completed successfully to ${outputFile}`);
} catch (error) {
  console.error(`\nExport failed: ${error.message}`);
  process.exit(1);
}