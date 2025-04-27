import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side configuration (from sentry.server.config.ts)
    Sentry.init({
      // Use server-specific DSN if available, fall back to public DSN
      dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    
      // Adjust tracing sample rate based on environment
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    
      // Set to true for shorter stack traces
      normalizeDepth: 10,
    
      // Add server-side integrations
      integrations: [
        // Enable HTTP context capture for requests
        Sentry.httpIntegration(),
      ],
    
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
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime configuration (from sentry.edge.config.ts)
    Sentry.init({
      // Use server-specific DSN if available, fall back to public DSN
      dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
      
      // Edge functions have unique requirements - keep even lower sample rate in production
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
      
      // Add edge runtime integrations
      integrations: [
        // Add Winter CG Fetch integration for Edge Runtime
        Sentry.winterCGFetchIntegration()
      ],
      
      // Only enable in production
      enabled: process.env.NODE_ENV === 'production',
      
      // Filter sensitive information
      beforeSend(event, hint) {
        if (process.env.NODE_ENV !== 'production') {
          return null;
        }
        
        return event;
      },
    
      // Setting this option to true will print useful information to the console while you're setting up Sentry
      debug: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
