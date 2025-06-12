import { z } from 'zod';

/**
 * Maximum allowed image file size (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
];

/**
 * Validates a file object for image uploads
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` 
    };
  }
  
  // Check file type
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Accepted type is: image/jpeg` 
    };
  }
  
  return { valid: true };
}

/**
 * Validates an array of image files
 * Returns errors for each invalid file (if any)
 */
export function validateImageFiles(files: File[]): { valid: boolean; errors: Array<{ index: number; error: string }> } {
  const errors: Array<{ index: number; error: string }> = [];
  
  for (let i = 0; i < files.length; i++) {
    const validation = validateImageFile(files[i]);
    if (!validation.valid && validation.error) {
      errors.push({ index: i, error: validation.error });
    }
  }
  
  return { valid: errors.length === 0, errors };
} 