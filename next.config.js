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
  
  // Configure Sentry for application monitoring
  sentry: {
    // Hide source maps from public access
    hideSourceMaps: true,
    
    // Automatically instrument your code for error tracking
    autoInstrumentServerFunctions: true,
    
    // Turn off sentry logging in development
    disableLogger: process.env.NODE_ENV !== 'production',
  },
};

// Wrap with Sentry when in production
if (process.env.NODE_ENV === 'production') {
  // Only require Sentry in production to avoid dev dependencies
  const { withSentryConfig } = require('@sentry/nextjs');
  
  module.exports = withSentryConfig(nextConfig, {
    // Silence source map upload - we only want error tracking, not source map uploads
    // This keeps costs down for smaller projects
    silent: true,
    
    // Optionally configure sentry tunnel if needed for firewall situations
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  }, {
    // These options are for the '@sentry/webpack-plugin'
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring-tunnel',
    hideSourceMaps: true,
    disableLogger: true,
  });
} else {
  module.exports = nextConfig;
}

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
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
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
