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
 */
export async function checkImageExists(imagePath: string): Promise<boolean> {
  try {
    // Call to a function you might want to add to ImageService
    return await ImageService.checkImageExists(imagePath);
  } catch (error) {
    console.error('Error checking image existence:', error);
    return false;
  }
} 