import 'server-only';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import sharp from 'sharp';
import { validateImageFile } from '@/lib/validators/imageValidators';
import { createLogger } from '@/lib/logging';
import { put, del } from '@vercel/blob';

// Create a logger instance
const logger = createLogger('ImageService');

// Define thumbnail sizes to generate
const THUMBNAIL_SIZES = [
  { width: 200, height: 200, suffix: 'thumb' },  // Small thumbnail for listings grid
  { width: 600, height: undefined, suffix: 'medium' }, // Medium size for gallery previews
  { width: 1200, height: undefined, suffix: 'large' }, // Large size for full-screen views
];

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
   * Saves an image file to Vercel Blob storage and returns the URL
   */
  static async saveImage(file: File, subdirectory: string = ''): Promise<string> {
    try {
      // Validate the image before processing
      this.validateImage(file);
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension while ensuring it's lowercase
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uuid = uuidv4();
      const filename = `${uuid}.${ext}`;
      
      // Include subdirectory in filename for Vercel Blob if provided
      const blobFilename = subdirectory ? `${subdirectory}/${filename}` : filename;
      
      // Upload to Vercel Blob
      const { url } = await put(blobFilename, buffer, { access: 'public' });
      
      logger.info(`Saved image to Vercel Blob: ${url}`);
      
      // For processable formats, generate and upload thumbnails
      const isProcessableFormat = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext);
      
      if (isProcessableFormat) {
        const sharpInstance = sharp(buffer);
        
        // Generate and upload thumbnails
        for (const size of THUMBNAIL_SIZES) {
          try {
            const thumbnailFilename = `${uuid}-${size.suffix}.webp`; // Always save thumbnails as WebP
            const blobThumbnailFilename = subdirectory 
              ? `${subdirectory}/${thumbnailFilename}` 
              : thumbnailFilename;
            
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
              
            await put(blobThumbnailFilename, thumbnailBuffer, { access: 'public' });
          } catch (thumbError) {
            logger.error(`Error generating thumbnail for ${filename}:`, { thumbError });
            // Continue with next thumbnail
          }
        }
      }
      
      // Return the URL from Vercel Blob
      return url;
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
      const url = new URL(originalUrl);
      const pathname = url.pathname;
      const lastDotIndex = pathname.lastIndexOf('.');
      
      if (lastDotIndex === -1) return originalUrl;
      
      const filenameWithoutExt = pathname.substring(0, lastDotIndex);
      const origin = url.origin;
      
      // Construct the variant URL
      return `${origin}${filenameWithoutExt}-${size}.webp`;
    } catch (error) {
      logger.error(`Error generating variant path for ${originalUrl}:`, { error });
      return originalUrl;
    }
  }

  /**
   * Deletes an image file and its variants from Vercel Blob
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      if (!imageUrl) return false;
      
      // Delete the original image
      try {
        await del(imageUrl);
        logger.info(`Successfully deleted image from Vercel Blob: ${imageUrl}`);
        
        // Try to delete thumbnail variants
        try {
          // Parse the URL to extract components for thumbnail variants
          const url = new URL(imageUrl);
          const pathname = url.pathname;
          const lastDotIndex = pathname.lastIndexOf('.');
          
          if (lastDotIndex !== -1) {
            const filenameWithoutExt = pathname.substring(0, lastDotIndex);
            const origin = url.origin;
            
            // Delete each thumbnail variant
            for (const size of THUMBNAIL_SIZES) {
              const thumbnailUrl = `${origin}${filenameWithoutExt}-${size.suffix}.webp`;
              try {
                await del(thumbnailUrl);
              } catch (err) {
                // Log but don't fail if thumbnail deletion fails
                logger.warn(`Failed to delete thumbnail: ${thumbnailUrl}`, { err });
              }
            }
          }
        } catch (variantError) {
          // Log but don't fail if thumbnail deletion fails
          logger.warn(`Error deleting image variants for ${imageUrl}:`, { variantError });
        }
        
        return true;
      } catch (delError) {
        logger.error(`Failed to delete image from Vercel Blob: ${imageUrl}`, { delError });
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