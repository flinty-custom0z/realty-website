import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust tracing sample rate based on environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  
  // Set to true for shorter stack traces
  normalizeDepth: 10,
  
  // Enable performance monitoring
  integrations: [
    new Sentry.BrowserTracing({
      // Set sampling based on user interaction
      tracingOrigins: ['localhost', /^\//],
    }),
    new Sentry.Replay({
      // We recommend starting with a low sample rate and adjust as needed
      // Only capture errors for replay
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
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