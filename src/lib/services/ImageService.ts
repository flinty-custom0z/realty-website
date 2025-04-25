import 'server-only';
import { writeFile, mkdir, access, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import sharp from 'sharp';
import { existsSync } from 'fs';

// Define thumbnail sizes to generate
const THUMBNAIL_SIZES = [
  { width: 200, height: 200, suffix: 'thumb' },  // Small thumbnail for listings grid
  { width: 600, height: undefined, suffix: 'medium' }, // Medium size for gallery previews
  { width: 1200, height: undefined, suffix: 'large' }, // Large size for full-screen views
];

export class ImageService {
  /**
   * Ensures that a directory exists, creating it if it doesn't
   */
  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await access(dirPath);
    } catch (error) {
      // Directory doesn't exist, create it
      await mkdir(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  }

  /**
   * Saves an image file to disk, generates thumbnails and returns the relative path
   */
  static async saveImage(file: File, subdirectory: string = ''): Promise<string> {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension while ensuring it's lowercase
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uuid = uuidv4();
      const filename = `${uuid}.${ext}`;

      // Ensure images directory exists
      const baseDir = path.join(process.cwd(), 'public', 'images');
      const imagesDir = subdirectory ? path.join(baseDir, subdirectory) : baseDir;
      await this.ensureDirectoryExists(imagesDir);

      const filePath = path.join(imagesDir, filename);
      console.log(`Saving image to: ${filePath}`);

      // Check if format is valid for sharp
      const isProcessableFormat = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext);
      
      if (isProcessableFormat) {
        // Process original image - compress it before saving
        const sharpInstance = sharp(buffer);
        
        // Apply basic optimization based on format
        let optimizedBuffer: Buffer;
        
        if (ext === 'png') {
          optimizedBuffer = await sharpInstance.png({ quality: 90 }).toBuffer();
        } else if (ext === 'jpg' || ext === 'jpeg') {
          optimizedBuffer = await sharpInstance.jpeg({ quality: 85 }).toBuffer();
        } else if (ext === 'webp') {
          optimizedBuffer = await sharpInstance.webp({ quality: 85 }).toBuffer();
        } else {
          // For other formats, use the original buffer
          optimizedBuffer = buffer;
        }
        
        // Save the optimized original
        await writeFile(filePath, optimizedBuffer);
        
        // Generate and save thumbnails
        for (const size of THUMBNAIL_SIZES) {
          try {
            const thumbnailFilename = `${uuid}-${size.suffix}.webp`; // Always save thumbnails as WebP for better compression
            const thumbnailPath = path.join(imagesDir, thumbnailFilename);
            
            const resizeOptions: sharp.ResizeOptions = {
              width: size.width,
              height: size.height,
              fit: 'inside',
              withoutEnlargement: true,
            };
            
            await sharpInstance
              .clone()
              .resize(resizeOptions)
              .webp({ quality: 80 })
              .toFile(thumbnailPath);
              
          } catch (thumbError) {
            console.error(`Error generating thumbnail for ${filename}:`, thumbError);
            // Continue with next thumbnail or original save
          }
        }
      } else {
        // For unsupported formats (like SVG), just save the original
        await writeFile(filePath, buffer);
      }
      
      // Return path relative to public directory
      return subdirectory ? `/images/${subdirectory}/${filename}` : `/images/${filename}`;
    } catch (error) {
      console.error("Error saving image:", error);
      throw new Error(`Failed to save image: ${error}`);
    }
  }

  /**
   * Gets path for a specific size variant of an image
   */
  static getImageVariantPath(originalPath: string, size: string): string {
    if (!originalPath) return '';
    
    const directory = path.dirname(originalPath);
    const filename = path.basename(originalPath);
    const filenameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    
    return `${directory}/${filenameWithoutExt}-${size}.webp`;
  }

  /**
   * Deletes an image file and its variants from disk
   */
  static async deleteImage(imagePath: string): Promise<boolean> {
    try {
      if (!imagePath) return false;
      
      // Convert relative path to absolute path
      const originalPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
      
      // Get directory and filename info
      const directory = path.dirname(originalPath);
      const filename = path.basename(originalPath);
      const filenameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
      
      // Try to delete the original file
      try {
        await unlink(originalPath);
      } catch (err) {
        console.error(`Error deleting original image ${imagePath}:`, err);
      }
      
      // Also try to delete all thumbnail variants
      for (const size of THUMBNAIL_SIZES) {
        try {
          const thumbnailPath = path.join(directory, `${filenameWithoutExt}-${size.suffix}.webp`);
          await unlink(thumbnailPath);
        } catch (err) {
          // Ignore errors for thumbnail deletion
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error in deleteImage for ${imagePath}:`, error);
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

  /**
   * Checks if an image file exists
   */
  static async checkImageExists(imagePath: string): Promise<boolean> {
    if (!imagePath) return false;
    
    try {
      // Convert relative path to absolute path
      const absolutePath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
      return existsSync(absolutePath);
    } catch (error) {
      console.error(`Error checking if image exists: ${imagePath}`, error);
      return false;
    }
  }
} 