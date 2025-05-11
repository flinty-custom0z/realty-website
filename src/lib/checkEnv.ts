/**
 * This script runs at application startup to verify required 
 * environment variables are properly set
 */

export function checkRequiredEnvVars() {
  // List of critical environment variables
  const requiredVars = ['JWT_SECRET'];
  
  // Check each variable
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const errorMsg = `
------------------------------------------------------------
CRITICAL SECURITY ERROR: Missing required environment variables:
${missing.join(', ')}

For JWT_SECRET: Generate a secure random string (minimum 32 chars)
Example: Run 'openssl rand -base64 32' in terminal

Application startup aborted for security reasons.
------------------------------------------------------------
`;
    console.error(errorMsg);
    
    // Instead of exiting, we'll just throw an error which will
    // cause the request to fail in both Node.js and Edge runtimes
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Environment validation successful - all required variables are set');
} 