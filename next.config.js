/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images configuration
    images: {
      unoptimized: false, // Let Next.js optimize images
    },
    
    // Add any additional configuration you need
    env: {
    // Add any environment variables you want available in client code
    },
    
    // Handle paths more efficiently
    // Explicitly set trailing slash behavior
    trailingSlash: false,
  };
  
  module.exports = nextConfig;