// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Use server-specific DSN if available, fall back to public DSN
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust tracing sample rate based on environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Set to true for shorter stack traces
  normalizeDepth: 10,

  // Only enable in production to reduce noise
  enabled: process.env.NODE_ENV === 'production',

  // Filter out sensitive information
  beforeSend(event: Sentry.Event) {
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    
    return event;
  }
});
