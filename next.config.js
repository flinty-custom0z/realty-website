/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images configuration
  images: {
    unoptimized: false,
    domains: ['localhost', '81ipzxotpmf8rssh.public.blob.vercel-storage.com'],
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
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
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

  // Optimize build performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

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

  // Skip example and test pages in fast builds
  ...(process.env.SKIP_EXAMPLE_PAGES === 'true' && {
    pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
    experimental: { 
      // Use a smaller subset of pages when in fast build mode
      cpus: Math.max(1, Math.min(4, require('os').cpus().length - 1))
    },
    // Exclude sentry example pages and other non-essential pages
    excludeRoutes: [
      '/sentry-example-page',
      '/api/sentry-example-api',
      '/theme-demo'
    ]
  }),

  // Optimization for faster builds (only in development)
  ...(process.env.NODE_ENV !== 'production' && {
    typescript: {
      // Skip type checking during development builds for speed
      ignoreBuildErrors: true
    },
    staticPageGenerationTimeout: 120,
    experimental: {
      // Enable these only in development for faster builds
      cpus: Math.max(1, Math.min(4, require('os').cpus().length - 1))
    }
  })
};

// Only use Sentry in production
if (process.env.NODE_ENV === 'production') {
  const { withSentryConfig } = require('@sentry/nextjs');
  
  module.exports = withSentryConfig(
    nextConfig,
    {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options
      
      org: "flinty-custom0z",
      project: "javascript-nextjs",
      
      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,
      
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
      
      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,
      
      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      tunnelRoute: "/monitoring",
      
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
      
      // Enables automatic instrumentation of Vercel Cron Monitors.
      automaticVercelMonitors: true,
    }
  );
} else {
  module.exports = nextConfig;
}
