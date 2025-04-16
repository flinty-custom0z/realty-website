const fs = require('fs');
const path = require('path');

// Check if the images directory exists and has correct permissions
function checkImagesDirectory() {
  const imagesPath = path.join(process.cwd(), 'public', 'images');
  
  console.log(`Checking images directory: ${imagesPath}`);
  
  // Make sure the directory exists
  if (!fs.existsSync(imagesPath)) {
    console.log('Images directory does not exist. Creating it...');
    fs.mkdirSync(imagesPath, { recursive: true });
  }
  
  // List all files in the directory
  const files = fs.readdirSync(imagesPath);
  console.log(`Found ${files.length} files in images directory`);
  
  // Check each file
  files.forEach((file) => {
    const filePath = path.join(imagesPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      // Check file permissions
      console.log(`File: ${file}, Size: ${stats.size} bytes, Permissions: ${stats.mode.toString(8)}`);
      
      // Try to read the file
      try {
        const data = fs.readFileSync(filePath, { encoding: null });
        console.log(`Successfully read ${file}, size: ${data.length} bytes`);
        
        // Check if it starts with JPEG or PNG magic numbers
        if (data.length > 2) {
          const isJPEG = data[0] === 0xFF && data[1] === 0xD8;
          const isPNG = data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47;
          
          if (isJPEG) {
            console.log(`${file} is a valid JPEG image`);
          } else if (isPNG) {
            console.log(`${file} is a valid PNG image`);
          } else {
            console.warn(`WARNING: ${file} does not appear to be a valid image file`);
          }
        }
      } catch (error) {
        console.error(`Error reading ${file}: ${error.message}`);
      }
    }
  });
  
  console.log('Images directory check complete');
}

checkImagesDirectory();