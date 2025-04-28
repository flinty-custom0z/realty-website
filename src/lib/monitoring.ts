import * as Sentry from '@sentry/nextjs';
import { systemMonitor, createLogger } from './logging';

const logger = createLogger('Monitoring');

interface ResourceUsage {
  name: string;
  used: number;
  limit: number;
  unit: string;
  percentUsed: number;
}

// Resource warning thresholds
const WARNING_THRESHOLD = 0.7; // 70%
const CRITICAL_THRESHOLD = 0.9; // 90%

/**
 * Monitor resource usage against limits and send alerts if thresholds are crossed
 */
export const monitorResourceUsage = (resources: ResourceUsage[]) => {
  if (!resources || !Array.isArray(resources)) return;

  // Check each resource against thresholds
  resources.forEach(resource => {
    const percentUsed = resource.percentUsed || (resource.used / resource.limit);
    
    if (percentUsed >= CRITICAL_THRESHOLD) {
      // Critical threshold exceeded - send alert to Sentry
      const message = `CRITICAL: ${resource.name} at ${Math.round(percentUsed * 100)}% of limit`;
      logger.error(message, { resource });
      
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureMessage(message, {
          level: 'fatal',
          contexts: {
            resource: {
              name: resource.name,
              used: `${resource.used} ${resource.unit}`,
              limit: `${resource.limit} ${resource.unit}`,
              percentUsed: `${Math.round(percentUsed * 100)}%`
            }
          }
        });
      }
    } 
    else if (percentUsed >= WARNING_THRESHOLD) {
      // Warning threshold exceeded - log warning
      const message = `WARNING: ${resource.name} at ${Math.round(percentUsed * 100)}% of limit`;
      logger.warn(message, { resource });
      
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureMessage(message, {
          level: 'warning',
          contexts: {
            resource: {
              name: resource.name,
              used: `${resource.used} ${resource.unit}`,
              limit: `${resource.limit} ${resource.unit}`,
              percentUsed: `${Math.round(percentUsed * 100)}%`
            }
          }
        });
      }
    }
  });
};

/**
 * Check database size and alert if approaching limits
 */
export const checkDatabaseSize = async (prisma: any) => {
  try {
    // Query database size (this is a simple approximation)
    const tablesInfo = await prisma.$queryRaw`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as db_size,
        pg_database_size(current_database()) as db_size_bytes
    `;
    
    if (Array.isArray(tablesInfo) && tablesInfo.length > 0) {
      const sizeBytes = (tablesInfo[0] as any).db_size_bytes || 0;
      const sizeGB = parseFloat((sizeBytes / (1024 * 1024 * 1024)).toFixed(2)); // Convert bytes to GB
      
      // Monitor database size against limit (3GB in free tier)
      monitorResourceUsage([{
        name: 'Neon Database Size',
        used: sizeGB,
        limit: 3, // 3GB limit
        unit: 'GB',
        percentUsed: sizeGB / 3
      }]);
      
      return sizeGB;
    }
  } catch (error) {
    logger.error('Failed to check database size', { error });
    return null;
  }
};

/**
 * Set up UptimeRobot-compatible health endpoint
 * UptimeRobot expects a 200 status code for healthy services
 */
export const getUptimeStatus = async (prisma: any) => {
  try {
    // Check database connection
    const dbHealthy = await systemMonitor.checkDatabaseConnection(prisma);
    
    // Track additional critical components here as needed
    const systemHealthy = dbHealthy; // Add more checks as needed
    
    return {
      status: systemHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy'
      }
    };
  } catch (error) {
    logger.error('Health check failed', { error });
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    };
  }
}; 