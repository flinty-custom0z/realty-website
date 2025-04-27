import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Helper function to handle Zod validation errors in API routes
 * Returns a formatted error response
 */
export function handleValidationError(error: unknown) {
  if (error instanceof ZodError) {
    // Format Zod validation errors
    const formattedErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));
    
    return NextResponse.json(
      { 
        error: 'Validation error',
        validationErrors: formattedErrors 
      }, 
      { status: 400 }
    );
  }
  
  // Handle non-validation errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 
    { status: 500 }
  );
} 