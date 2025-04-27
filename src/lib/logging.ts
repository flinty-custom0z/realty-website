import * as Sentry from '@sentry/nextjs';

// Logging levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Interface for structured log data
export interface LogData {
  message: string;
  level: LogLevel;
  timestamp?: Date;
  context?: Record<string, any>;
}

// Class to handle logging consistently across the application
export class Logger {
  private source: string;
  
  constructor(source: string) {
    this.source = source;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const timestamp = new Date();
    const logData: LogData = {
      message,
      level,
      timestamp,
      context: {
        ...context,
        source: this.source,
      },
    };

    // Exclude sensitive data from logs
    const sanitizedContext = this.sanitizeContext(context);
    
    // Format message for console
    const formattedMessage = `[${timestamp.toISOString()}] [${level.toUpperCase()}] [${this.source}] ${message}`;
    
    // Log to appropriate console method based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, sanitizedContext);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, sanitizedContext);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, sanitizedContext);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage, sanitizedContext);
        
        // Send errors to Sentry
        if (process.env.NODE_ENV === 'production') {
          const sentryContext = { ...sanitizedContext, source: this.source };
          
          if (level === LogLevel.FATAL) {
            Sentry.captureMessage(message, {
              level: 'fatal',
              contexts: { additionalInfo: sentryContext },
            });
          } else {
            Sentry.captureMessage(message, {
              level: 'error',
              contexts: { additionalInfo: sentryContext },
            });
          }
        }
        break;
    }

    return logData;
  }

  // Remove sensitive data before logging
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'credit', 'card'];
    const sanitized = { ...context };
    
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeContext(sanitized[key]);
      }
    });
    
    return sanitized;
  }

  debug(message: string, context?: Record<string, any>) {
    return this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    return this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    return this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>) {
    return this.log(LogLevel.ERROR, message, context);
  }

  fatal(message: string, context?: Record<string, any>) {
    return this.log(LogLevel.FATAL, message, context);
  }
  
  // Capture and log exceptions
  exception(error: Error, context?: Record<string, any>) {
    const errorMessage = error.message || 'An unknown error occurred';
    const errorContext = {
      ...context,
      stack: error.stack,
      name: error.name,
    };
    
    // Log locally
    this.error(errorMessage, errorContext);
    
    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        contexts: { additionalInfo: { ...this.sanitizeContext(context), source: this.source } },
      });
    }
    
    return error;
  }
}

// Helper to create a new logger
export function createLogger(source: string): Logger {
  return new Logger(source);
}

// System monitoring functions
export const systemMonitor = {
  // Track resource usage
  recordResourceUsage: () => {
    if (typeof process !== 'undefined') {
      const memoryUsage = process.memoryUsage();
      const logger = createLogger('SystemMonitor');
      
      logger.info('Resource usage stats', {
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB', // Resident Set Size
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          external: Math.round((memoryUsage.external || 0) / 1024 / 1024) + 'MB',
        },
        uptime: process.uptime() + 's',
      });
    }
  },
  
  // Check database connection
  checkDatabaseConnection: async (prisma: any) => {
    const logger = createLogger('SystemMonitor');
    try {
      // Simple query to check DB connection
      await prisma.$queryRaw`SELECT 1 as connected`;
      logger.info('Database connection check successful');
      return true;
    } catch (error) {
      logger.fatal('Database connection failed', { error });
      
      // In production, send alert through Sentry
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureMessage('CRITICAL: Database connection failed', {
          level: 'fatal',
        });
      }
      
      return false;
    }
  },
  
  // Alert for critical system events
  alertCriticalEvent: (message: string, data?: Record<string, any>) => {
    const logger = createLogger('SystemMonitor');
    logger.fatal(message, data);
  }
}; 