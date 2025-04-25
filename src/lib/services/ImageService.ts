import { writeFile, mkdir, access, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

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
   * Saves an image file to disk and returns the relative path
   */
  static async saveImage(file: File, subdirectory: string = ''): Promise<string> {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `${uuidv4()}.${ext}`;

      // Ensure images directory exists
      const baseDir = path.join(process.cwd(), 'public', 'images');
      const imagesDir = subdirectory ? path.join(baseDir, subdirectory) : baseDir;
      await this.ensureDirectoryExists(imagesDir);

      const filePath = path.join(imagesDir, filename);
      console.log(`Saving image to: ${filePath}`);

      await writeFile(filePath, buffer);
      
      // Return path relative to public directory
      return subdirectory ? `/images/${subdirectory}/${filename}` : `/images/${filename}`;
    } catch (error) {
      console.error("Error saving image:", error);
      throw new Error(`Failed to save image: ${error}`);
    }
  }

  /**
   * Deletes an image file from disk
   */
  static async deleteImage(imagePath: string): Promise<boolean> {
    try {
      if (!imagePath) return false;
      
      // Convert relative path to absolute path
      const absolutePath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
      
      await unlink(absolutePath);
      return true;
    } catch (error) {
      console.error(`Error deleting image ${imagePath}:`, error);
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