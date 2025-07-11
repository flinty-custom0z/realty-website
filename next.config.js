/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Images configuration
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 200, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/image/**',
      },
    ],
  },
    

  
  // Handle paths more efficiently
  trailingSlash: false,
  
  // Enable strict mode for better performance
  reactStrictMode: true,

  // Optimize build performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Compression
  compress: true,
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  
  // Performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        source: '/api/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO optimization
  async redirects() {
    return [
      {
        source: '/listing-category/:slug',
        has: [{ type: 'query', key: 'page', value: '1' }],
        destination: '/listing-category/:slug',
        permanent: true,
      },
    ];
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

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@prisma/client'],
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB'],
  }
};

// Apply bundle analyzer wrapper
const configWithAnalyzer = withBundleAnalyzer(nextConfig);

// Only use Sentry in production
if (process.env.NODE_ENV === 'production') {
  const { withSentryConfig } = require('@sentry/nextjs');
  
  module.exports = withSentryConfig(
    configWithAnalyzer,
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
  module.exports = configWithAnalyzer;
}
