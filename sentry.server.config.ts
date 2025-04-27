import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: 1.0,
  
  // Set to true for shorter stack traces
  normalizeDepth: 10,
  
  // Only enable in production to reduce noise
  enabled: process.env.NODE_ENV === 'production',
  
  // Filter out sensitive information
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    
    return event;
  }
}); 