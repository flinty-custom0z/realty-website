import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';
import * as Sentry from '@sentry/nextjs';

const logger = createLogger('TestErrorApi');

export async function GET(req: NextRequest) {
  try {
    // Get the error type from the query parameters
    const { searchParams } = new URL(req.url);
    const errorType = searchParams.get('type') || 'standard';
    
    // Log the test request
    logger.info('Test error API called', { errorType, ip: req.headers.get('x-forwarded-for') || 'unknown' });
    
    switch (errorType) {
      case 'validation':
        // Validation error
        logger.warn('Test validation error triggered');
        throw new ApiError('Test validation error', 400);
        
      case 'not-found':
        // Not found error
        logger.warn('Test not found error triggered');
        throw new ApiError('Test resource not found', 404);
        
      case 'server':
        // Server error with Sentry
        logger.error('Test server error triggered');
        Sentry.captureException(new Error('Test server error from API'));
        throw new ApiError('Test server error', 500);
        
      case 'unhandled':
        // Unhandled error that should be caught by the error handler
        logger.error('Test unhandled error triggered');
        throw new Error('Test unhandled error from API');
        
      default:
        // Standard test error
        logger.info('Test standard error triggered');
        return NextResponse.json({ 
          message: 'Test error API called successfully', 
          errorType 
        });
    }
  } catch (error) {
    return handleApiError(error);
  }
} 