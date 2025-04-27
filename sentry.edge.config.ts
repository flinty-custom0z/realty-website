import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Edge functions have unique requirements
  tracesSampleRate: 0.5, // Lower sample rate for edge functions to reduce overhead
  
  // Edge environments have different performance characteristics
  integrations: [],
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Filter sensitive information
  beforeSend(event) {
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    
    return event;
  }
}); 