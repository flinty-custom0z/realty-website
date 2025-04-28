import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { systemMonitor } from '@/lib/logging';
import { checkDatabaseSize, getUptimeStatus } from '@/lib/monitoring';
import { PrismaClient } from '@prisma/client';
import { handleApiError } from '@/lib/validators/errorHandler';

const logger = createLogger('HealthCheck');
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Check start time for performance monitoring
    const startTime = Date.now();
    
    // Log health check request
    logger.info('Health check request initiated', {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });
    
    // Check for UptimeRobot or similar monitoring service
    const isMonitoringService = (req.headers.get('user-agent') || '').toLowerCase().includes('uptimerobot');
    
    // For monitoring services, return a simplified response optimized for uptime checking
    if (isMonitoringService) {
      logger.info('UptimeRobot health check detected');
      const uptimeStatus = await getUptimeStatus(prisma);
      
      // UptimeRobot only cares about the HTTP status code (200 = up, anything else = down)
      return NextResponse.json(uptimeStatus);
    }
    
    // Regular health check for the admin dashboard
    
    // Check database connection
    const dbHealthy = await systemMonitor.checkDatabaseConnection(prisma);
    
    // Record resource usage
    systemMonitor.recordResourceUsage();
    
    // Check database size
    const dbSize = await checkDatabaseSize(prisma);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // System health status
    const status = dbHealthy ? 'healthy' : 'degraded';
    
    // If database is not healthy, log as warning
    if (!dbHealthy) {
      logger.warn('Health check shows degraded system status', {
        component: 'database',
        responseTime
      });
    } else {
      logger.info('Health check completed successfully', { responseTime });
    }
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      components: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
      },
      resources: {
        databaseSize: dbSize ? `${dbSize} GB` : 'unknown',
      },
      performance: {
        responseTime: `${responseTime}ms`,
      },
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    return handleApiError(error);
  }
} 