/**
 * Environment variables manager to ensure critical secrets are properly set
 */
import { checkRequiredEnvVars } from './checkEnv';

// Run environment validation at module initialization
// This will be executed when the app starts
try {
  checkRequiredEnvVars();
} catch (error) {
  // Log but continue in development to allow easier debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Environment validation failed, but continuing in development mode.');
    console.error(error);
  }
}

// Function to get required environment variables
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  
  // Check if the environment variable is set
  if (!value) {
    // In development, we show a clear error message
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        `Environment variable ${key} is not set. This is required for application security.`
      );
    }
    
    // In production, we log to console but also throw error to prevent startup with missing secrets
    console.error(`CRITICAL ERROR: Environment variable ${key} is not set!`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

// JWT Secret - never falls back to a default value
export const JWT_SECRET = getRequiredEnvVar('JWT_SECRET'); 