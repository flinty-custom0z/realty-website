import 'server-only';
import { ImageService } from '@/lib/services/ImageService';

/**
 * Server action to get the path for a specific size variant of an image
 * This function is exported from a server-only module and can be safely used in client components
 */
export async function getImageVariantPath(originalPath: string, size: string): Promise<string> {
  return ImageService.getImageVariantPath(originalPath, size);
}

/**
 * Server action to check if an image exists
 * For Vercel Blob URLs, we assume the image exists if the URL is valid
 */
export async function checkImageExists(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return false;
    
    // For Vercel Blob URLs, we can attempt to validate by checking if the URL is valid
    try {
      const url = new URL(imageUrl);
      // Verify it's a Vercel Blob URL (typically contains .vercel.blob in the domain)
      // or adjust based on your actual blob URL pattern
      return url.hostname.includes('.vercel.blob') || url.hostname.includes('vercel-blob.com');
    } catch {
      // If not a valid URL, return false
      return false;
    }
  } catch (error) {
    console.error('Error checking image existence:', error);
    return false;
  }
} 