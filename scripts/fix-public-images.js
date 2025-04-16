// fix-public-images.js
const fs = require('fs');
const path = require('path');

// Check if the public directory exists with proper permissions
function fixPublicDirectory() {
  const publicDir = path.join(process.cwd(), 'public');
  const imagesDir = path.join(publicDir, 'images');
  
  console.log('Checking public directory structure...');
  
  // Create or fix public directory
  if (!fs.existsSync(publicDir)) {
    console.log('Creating public directory');
    fs.mkdirSync(publicDir, { recursive: true, mode: 0o755 });
  } else {
    // Fix permissions if needed
    try {
      fs.chmodSync(publicDir, 0o755);
      console.log('Fixed public directory permissions');
    } catch (err) {
      console.warn('Could not update public directory permissions', err);
    }
  }
  
  // Create or fix images directory
  if (!fs.existsSync(imagesDir)) {
    console.log('Creating images directory');
    fs.mkdirSync(imagesDir, { recursive: true, mode: 0o755 });
  } else {
    // Fix permissions if needed
    try {
      fs.chmodSync(imagesDir, 0o755);
      console.log('Fixed images directory permissions');
    } catch (err) {
      console.warn('Could not update images directory permissions', err);
    }
  }
  
  // Check and fix permissions on all image files
  if (fs.existsSync(imagesDir)) {
    try {
      const files = fs.readdirSync(imagesDir);
      console.log(`Found ${files.length} files in images directory`);
      
      files.forEach(file => {
        const filePath = path.join(imagesDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            fs.chmodSync(filePath, 0o644);
          }
        } catch (err) {
          console.warn(`Could not update permissions for ${file}`, err);
        }
      });
      
      console.log('Updated file permissions in images directory');
    } catch (err) {
      console.error('Error reading images directory', err);
    }
  }
  
  console.log('Directory structure check completed');
}

// Run the fixes
fixPublicDirectory();