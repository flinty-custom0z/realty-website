import 'server-only';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import sharp from 'sharp';
import { validateImageFile } from '@/lib/validators/imageValidators';
import { createLogger } from '@/lib/logging';
import * as fs from 'fs/promises';
import * as path from 'path';

// Create a logger instance
const logger = createLogger('ImageService');

// Define thumbnail sizes to generate
const THUMBNAIL_SIZES = [
  { width: 200, height: 200, suffix: 'thumb' },  // Small thumbnail for listings grid
  { width: 600, height: undefined, suffix: 'medium' }, // Medium size for gallery previews
  { width: 1200, height: undefined, suffix: 'large' }, // Large size for full-screen views
];

// Helper function to ensure upload directory exists
async function ensureUploadDirectory(subdirectory: string = ''): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdirectory);
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

export class ImageService {
  /**
   * Validates an image file before saving
   * @throws Error if the image is invalid
   */
  static validateImage(file: File): void {
    const validation = validateImageFile(file);
    if (!validation.valid && validation.error) {
      throw new Error(validation.error);
    }
  }

  /**
   * Saves an image file to local storage and returns the URL path
   */
  static async saveImage(file: File, subdirectory: string = 'listings'): Promise<string> {
    try {
      // Validate the image before processing
      this.validateImage(file);
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension while ensuring it's lowercase
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uuid = uuidv4();
      const filename = `${uuid}.${ext}`;
      
      // Ensure upload directory exists
      const uploadDir = await ensureUploadDirectory(subdirectory);
      const filePath = path.join(uploadDir, filename);
      
      // Save the original file to local storage
      await fs.writeFile(filePath, buffer);
      
      // Create the public URL path
      const publicUrl = `/uploads/${subdirectory}/${filename}`;
      
      logger.info(`Saved image to local storage: ${publicUrl}`);
      
      // For processable formats, generate and save thumbnails
      const isProcessableFormat = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext);
      
      if (isProcessableFormat) {
        const sharpInstance = sharp(buffer);
        
        // Generate and save thumbnails
        for (const size of THUMBNAIL_SIZES) {
          try {
            const thumbnailFilename = `${uuid}-${size.suffix}.webp`; // Always save thumbnails as WebP
            const thumbnailPath = path.join(uploadDir, thumbnailFilename);
            
            const resizeOptions: sharp.ResizeOptions = {
              width: size.width,
              height: size.height,
              fit: 'inside',
              withoutEnlargement: true,
            };
            
            const thumbnailBuffer = await sharpInstance
              .clone()
              .resize(resizeOptions)
              .webp({ quality: 80 })
              .toBuffer();
              
            await fs.writeFile(thumbnailPath, thumbnailBuffer);
          } catch (thumbError) {
            logger.error(`Error generating thumbnail for ${filename}:`, { thumbError });
            // Continue with next thumbnail
          }
        }
      }
      
      // Return the public URL path
      return publicUrl;
    } catch (error) {
      logger.error("Error saving image:", { error });
      throw new Error(`Failed to save image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets path for a specific size variant of an image
   */
  static getImageVariantPath(originalUrl: string, size: string): string {
    if (!originalUrl) return '';
    
    // Parse the URL to extract components
    try {
      // Handle both full URLs and path-only URLs
      let pathname: string;
      if (originalUrl.startsWith('http')) {
        const url = new URL(originalUrl);
        pathname = url.pathname;
      } else {
        pathname = originalUrl;
      }
      
      const lastDotIndex = pathname.lastIndexOf('.');
      
      if (lastDotIndex === -1) return originalUrl;
      
      const filenameWithoutExt = pathname.substring(0, lastDotIndex);
      
      // Construct the variant URL
      return `${filenameWithoutExt}-${size}.webp`;
    } catch (error) {
      logger.error(`Error generating variant path for ${originalUrl}:`, { error });
      return originalUrl;
    }
  }

  /**
   * Deletes an image file and its variants from local storage
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      if (!imageUrl) return false;
      
      // Convert URL to file path
      let filePath: string;
      if (imageUrl.startsWith('/uploads/')) {
        filePath = path.join(process.cwd(), 'public', imageUrl);
      } else if (imageUrl.startsWith('http')) {
        // Handle full URLs by extracting the path
        const url = new URL(imageUrl);
        if (url.pathname.startsWith('/uploads/')) {
          filePath = path.join(process.cwd(), 'public', url.pathname);
        } else {
          logger.warn(`Cannot delete external URL: ${imageUrl}`);
          return false;
        }
      } else {
        logger.warn(`Invalid image URL format: ${imageUrl}`);
        return false;
      }
      
      // Delete the original image
      try {
        await fs.unlink(filePath);
        logger.info(`Successfully deleted image from local storage: ${imageUrl}`);
        
        // Try to delete thumbnail variants
        try {
          // Extract filename without extension for thumbnail variants
          const dir = path.dirname(filePath);
          const filename = path.basename(filePath);
          const lastDotIndex = filename.lastIndexOf('.');
          
          if (lastDotIndex !== -1) {
            const filenameWithoutExt = filename.substring(0, lastDotIndex);
            
            // Delete each thumbnail variant
            for (const size of THUMBNAIL_SIZES) {
              const thumbnailFilename = `${filenameWithoutExt}-${size.suffix}.webp`;
              const thumbnailPath = path.join(dir, thumbnailFilename);
              try {
                await fs.unlink(thumbnailPath);
              } catch (err) {
                // Log but don't fail if thumbnail deletion fails
                logger.warn(`Failed to delete thumbnail: ${thumbnailPath}`, { err });
              }
            }
          }
        } catch (variantError) {
          // Log but don't fail if thumbnail deletion fails
          logger.warn(`Error deleting image variants for ${imageUrl}:`, { variantError });
        }
        
        return true;
      } catch (delError) {
        logger.error(`Failed to delete image from local storage: ${imageUrl}`, { delError });
        return false;
      }
      
    } catch (error) {
      logger.error(`Error in deleteImage for ${imageUrl}:`, { error });
      return false;
    }
  }

  /**
   * Associates an image with a listing in the database
   */
  static async createImageRecord(listingId: string, imagePath: string, isFeatured: boolean = false) {
    return prisma.image.create({
      data: {
        listingId,
        path: imagePath,
        isFeatured,
      },
    });
  }

  /**
   * Deletes an image record from the database by ID
   */
  static async deleteImageRecord(imageId: string) {
    return prisma.image.delete({
      where: { id: imageId }
    });
  }

  /**
   * Updates the featured status of images for a listing
   */
  static async updateFeaturedImage(listingId: string, featuredImageId: string) {
    // First, set all images for this listing as not featured
    await prisma.image.updateMany({
      where: { listingId },
      data: { isFeatured: false }
    });

    // Then set the specified image as featured
    if (featuredImageId) {
      await prisma.image.update({
        where: { id: featuredImageId },
        data: { isFeatured: true }
      });
    }
  }

  /**
   * Gets image details for a set of image IDs
   */
  static async getImagesDetails(imageIds: string[]) {
    return prisma.image.findMany({
      where: { id: { in: imageIds } },
      select: {
        id: true,
        path: true,
        isFeatured: true
      }
    });
  }
} 