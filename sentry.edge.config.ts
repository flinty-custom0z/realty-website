// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Use server-specific DSN if available, fall back to public DSN
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Edge functions have unique requirements - keep even lower sample rate in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
  
  // Edge environments have different performance characteristics
  integrations: [],
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Filter sensitive information
  beforeSend(event: Sentry.Event) {
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    
    return event;
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry
  debug: false,
});
