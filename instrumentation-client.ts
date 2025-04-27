// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust tracing sample rate based on environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  
  // Set to true for shorter stack traces
  normalizeDepth: 10,
  
  // Set propagation targets for distributed tracing
  tracePropagationTargets: ['localhost', /^\//],
  
  // Enable performance monitoring
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // We recommend starting with a low sample rate and adjust as needed
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Set replay sample rates
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Only enable in production to reduce noise
  enabled: process.env.NODE_ENV === 'production',
  
  // Filter out sensitive information
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    
    return event;
  }
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;