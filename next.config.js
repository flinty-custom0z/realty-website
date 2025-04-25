/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images configuration
  images: {
    unoptimized: false,
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 384],
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

  // Configure webpack to handle Sharp and its dependencies properly
  webpack: (config, { isServer }) => {
    // Only include sharp in server builds
    if (isServer) {
      return config;
    }

    // For client-side builds, we need to handle sharp and its Node.js dependencies
    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          sharp: false,
          'fs/promises': false,
          fs: false,
          'node:crypto': false,
          'node:child_process': false,
        },
      },
    };
  },
};
  
module.exports = nextConfig;