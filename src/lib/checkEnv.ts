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
  
  // Check for recommended (but not required) environment variables
  const recommendedEmailVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missingEmail = recommendedEmailVars.filter(key => !process.env[key]);
  
  if (missingEmail.length > 0) {
    console.warn(`
⚠️  Warning: Missing recommended email environment variables:
${missingEmail.join(', ')}

The contact form may not work without these variables.
See CONTACT_FORM_SETUP.md for instructions on setting up email.
    `);
  }
  
  console.log('✅ Environment validation successful - all required variables are set');
} 