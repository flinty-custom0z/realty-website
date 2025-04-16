/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output to work with normal next start
  // output: 'standalone',
    
    // Enable static file serving from the public directory
    // This is actually the default, but we're being explicit
    images: {
      unoptimized: false, // Let Next.js optimize images
    },
    
  // Fix experimental options - use serverExternalPackages instead
    experimental: {
    serverExternalPackages: [], // Updated from serverComponentsExternalPackages
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