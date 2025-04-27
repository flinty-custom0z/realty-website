import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { 
  PrismaClientKnownRequestError, 
  PrismaClientValidationError,
  PrismaClientUnknownRequestError
} from '@prisma/client/runtime/library';

/**
 * Helper function to handle various error types in API routes
 * Returns a formatted error response with appropriate status codes
 */
export function handleApiError(error: unknown) {
  console.error('API error caught:', error);
  
  // Validation errors - 400 Bad Request
  if (error instanceof ZodError) {
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
  
  // Prisma known request errors
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle specific Prisma error codes
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        return NextResponse.json(
          { error: 'This record already exists', field: error.meta?.target }, 
          { status: 400 }
        );
      case 'P2003': // Foreign key constraint failed
        return NextResponse.json(
          { error: 'Referenced record does not exist', field: error.meta?.field_name }, 
          { status: 400 }
        );
      case 'P2025': // Record not found
        return NextResponse.json(
          { error: 'Record not found' }, 
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { error: 'Database constraint error', code: error.code }, 
          { status: 400 }
        );
    }
  }
  
  // Prisma validation errors
  if (error instanceof PrismaClientValidationError) {
    return NextResponse.json(
      { error: 'Invalid data format for database operation' }, 
      { status: 400 }
    );
  }
  
  // Other Prisma errors
  if (error instanceof PrismaClientUnknownRequestError) {
    return NextResponse.json(
      { error: 'Database operation failed' }, 
      { status: 500 }
    );
  }
  
  // Custom errors with status codes
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  
  // Generic errors
  if (error instanceof Error) {
    // Check if the error message suggests a client error
    if (isClientErrorMessage(error.message)) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      );
    }
    
    // Server error
    return NextResponse.json(
      { error: 'Internal server error', message: error.message }, 
      { status: 500 }
    );
  }
  
  // Unknown error type
  return NextResponse.json(
    { error: 'An unexpected error occurred' }, 
    { status: 500 }
  );
}

/**
 * Helper function to determine if error message suggests a client error
 */
function isClientErrorMessage(message: string): boolean {
  const clientErrorKeywords = [
    'invalid', 'missing', 'required', 'not found', 'already exists', 
    'unauthorized', 'forbidden', 'not allowed', 'validation', 'cannot be'
  ];
  
  return clientErrorKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

/**
 * Custom API error class with status code
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// For backward compatibility
export const handleValidationError = handleApiError; 