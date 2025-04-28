import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { PrismaClient } from '@prisma/client';
import { handleApiError } from '@/lib/validators/errorHandler';
import { checkDatabaseSize, monitorResourceUsage } from '@/lib/monitoring';

const logger = createLogger('ResourceLimits');
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    logger.info('Resource limits request initiated', {
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });
    
    // In a production app, this would connect to Vercel's API, Neon's API, etc.
    // to get real usage metrics
    
    // Check database size using our monitoring utility
    const dbSize = await checkDatabaseSize(prisma) || 1.75; // Default to estimate if query fails
    
    // In a real implementation, these would come from the respective platform APIs
    // For now, we'll use simulated values
    const edgeFunctionUsage = 25; // Simulated GB-hours used
    const buildHoursUsage = 0.3; // Simulated build hours used
    const blobStorageUsage = 45; // Simulated GB used
    
    // Create resource objects with usage percentages
    const resources = [
      {
        name: 'Edge Function Execution',
        used: edgeFunctionUsage,
        limit: 100,
        unit: 'GB-hours',
        warning: 'Most real-estate traffic OK.',
        percentUsed: edgeFunctionUsage / 100
      },
      {
        name: 'Build Hours',
        used: buildHoursUsage,
        limit: 1,
        unit: 'hours',
        warning: 'Don\'t trigger builds on every commit; use a develop branch.',
        percentUsed: buildHoursUsage
      },
      {
        name: 'Blob Storage Egress',
        used: blobStorageUsage,
        limit: 100,
        unit: 'GB',
        warning: 'Web-optimise images (already done).',
        percentUsed: blobStorageUsage / 100
      },
      {
        name: 'Neon Postgres',
        used: dbSize,
        limit: 3,
        unit: 'GB',
        warning: 'Archive old listing history or pay $0.25/GB overage.',
        percentUsed: dbSize / 3
      }
    ];
    
    // Monitor resource usage and send alerts if necessary
    monitorResourceUsage(resources);
    
    // Log the collected metrics
    logger.info('Resource limits collected', { resources });
    
    return NextResponse.json({
      resourceLimits: resources.map(({ percentUsed, ...rest }) => rest), // Remove percentUsed from response
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Resource limits request failed', { error });
    return handleApiError(error);
  }
} 