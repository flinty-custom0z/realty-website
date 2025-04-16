/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images configuration
    images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/image/**',
      },
    ],
    },
    
  // Add any additional configuration you need
  env: {
    // Add any environment variables you want available in client code
  },
  
  // Handle paths more efficiently
    trailingSlash: false,
  
  // Disable strict mode for now to avoid double rendering issues
  reactStrictMode: false,
  };
  
  module.exports = nextConfig;