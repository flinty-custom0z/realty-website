import prisma from '@/lib/prisma';
import { createLogger } from '@/lib/logging';

// Create a logger instance
const logger = createLogger('HistoryService');

export type HistoryAction = 'create' | 'update' | 'delete' | 'images';

export class HistoryService {
  /**
   * Creates a history entry for a listing action
   */
  static async createHistoryEntry(listingId: string, userId: string, changes: any, action: HistoryAction = 'update') {
    return prisma.listingHistory.create({
      data: {
        listingId,
        userId,
        changes,
        action
      }
    });
  }

  /**
   * Creates a history entry for initial listing creation
   */
  static async recordListingCreation(listingId: string, userId: string) {
    return this.createHistoryEntry(
      listingId, 
      userId, 
      { action: "Initial creation of listing" }, 
      'create'
    );
  }

  /**
   * Creates a history entry for image uploads
   */
  static async recordImageUploads(listingId: string, userId: string, uploadedImagesData: any[]) {
    if (uploadedImagesData.length === 0) return null;
    
    return this.createHistoryEntry(
      listingId,
      userId,
      {
        added: uploadedImagesData.map(img => ({
          filename: img.filename,
          size: img.size
        })),
        featuredImage: uploadedImagesData.find(img => img.isFeatured)?.path
      },
      'images'
    );
  }

  /**
   * Creates a history entry for field changes in a listing
   */
  static async recordFieldChanges(
    listingId: string, 
    userId: string, 
    originalData: Record<string, any>, 
    updatedData: Record<string, any>
  ) {
    // Calculate changes for history
    const changes: Record<string, { before: any, after: any }> = {};
    
    // Compare each field to detect changes
    Object.keys(updatedData).forEach(key => {
      const originalValue = originalData[key];
      const newValue = updatedData[key];
      
      // Only record if values are different
      if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          before: originalValue,
          after: newValue
        };
      }
    });
    
    // Only create history entry if there are actual changes
    if (Object.keys(changes).length > 0) {
      return this.createHistoryEntry(listingId, userId, changes);
    }
    
    return null;
  }

  /**
   * Creates a history entry for image changes
   */
  static async recordImageChanges(
    listingId: string,
    userId: string,
    added: any[] = [],
    deleted: any[] = [],
    featuredChanged: boolean = false,
    newFeaturedPath: string | null = null,
    previousFeaturedPath: string | null = null
  ) {
    const imageChanges: Record<string, any> = {};
    
    if (added.length > 0) {
      imageChanges.added = added;
    }
    
    if (deleted.length > 0) {
      imageChanges.deleted = deleted;
    }
    
    if (featuredChanged && newFeaturedPath) {
      // Store featured changes in the format expected by the UI component
      imageChanges.featuredChanged = {
        new: 'unknown', // We may not have the ID, just the path
        newPath: newFeaturedPath,
        previous: 'unknown',
        previousPath: previousFeaturedPath
      };
    }
    
    // Only create history entry if there are actual changes
    if (Object.keys(imageChanges).length > 0) {
      return this.createHistoryEntry(listingId, userId, imageChanges, 'images');
    }
    
    return null;
  }

  /**
   * Creates a history entry for listing deletion
   */
  static async recordListingDeletion(listingId: string, userId: string, listingData: any) {
    return this.createHistoryEntry(
      listingId,
      userId,
      { 
        message: "Listing deleted",
        details: listingData
      },
      'delete'
    );
  }

  /**
   * Gets history entries for a listing
   */
  static async getListingHistory(listingId: string) {
    return prisma.listingHistory.findMany({
      where: { listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Gets a detailed history timeline with enhanced image information
   */
  static async getHistoryTimeline(listingId: string) {
    try {
      // Use raw SQL to get the history data with user names
      const history = await prisma.$queryRaw`
        SELECT 
          lh.id, 
          lh."createdAt", 
          lh.action, 
          lh.changes,
          u.name as "userName"
        FROM "ListingHistory" lh
        JOIN "User" u ON lh."userId" = u.id
        WHERE lh."listingId" = ${listingId}
        ORDER BY lh."createdAt" DESC
      `;
      
      // Get all images for this listing to use in path construction
      let listingImages: any[] = [];
      try {
        listingImages = await prisma.image.findMany({
          where: { listingId }
        });
      } catch (e) {
        logger.error('Error fetching listing images:', { e });
      }
      
      // Map of image IDs to paths
      const imagePathMap = listingImages.reduce((acc: Record<string, string>, img: any) => {
        acc[img.id] = img.path.startsWith('/') ? img.path : `/${img.path}`;
        return acc;
      }, {});
      
      // Process history entries to enhance image information
      const processedHistory = (history as any[]).map(entry => {
        // For images action (changes to images)
        if (entry.action === 'images') {
          // Process deleted images
          if (entry.changes.deleted) {
            // Make sure image paths are properly formatted for frontend rendering
            entry.changes.deleted = entry.changes.deleted.map((img: any) => {
              if (img.path && !img.path.startsWith('http') && !img.path.startsWith('/')) {
                return { ...img, path: `/${img.path}` };
              }
              return img;
            });
          }
          
          // Process added images - add path information to added images
          if (entry.changes.added && Array.isArray(entry.changes.added)) {
            entry.changes.added = entry.changes.added.map((img: any) => {
              // If filename exists but no path, try to construct a path
              if (img.filename && !img.path) {
                // Extract potential image ID from filename if present
                const filenameMatch = img.filename.match(/^([^-]+)-(.+)$/);
                let imageId = filenameMatch ? filenameMatch[1] : null;
                
                // If we have an imageId, construct a path
                if (imageId) {
                  // Check if we have the image in our map
                  if (imagePathMap[imageId]) {
                    return { ...img, path: imagePathMap[imageId] };
                  }
                  
                  return {
                    ...img,
                    path: `/images/listing/${listingId}/${imageId}`
                  };
                }
                
                // If we can't extract an ID, try using the filename as path
                return {
                  ...img,
                  path: `/images/listing/${listingId}/${img.filename.replace(/\s+/g, '-')}`
                };
              }
              return img;
            });
          }
          
          // Process featured image changes from featuredImage field (v1 format)
          if (entry.changes.featuredImage && !entry.changes.featuredChanged) {
            // This is the old format where only the new featured image path is stored
            // We need to transform it to the format expected by the UI
            const featuredImagePath = entry.changes.featuredImage;
            
            // Convert to the format expected by the component
            entry.changes.featuredChanged = {
              new: 'unknown', // We don't have the ID, but this shouldn't matter
              newPath: featuredImagePath,
              previous: 'unknown',
              previousPath: null // We don't have this information from the old format
            };
          }
          
          // Process featured image changes (v2 format)
          if (entry.changes.featuredChanged) {
            const { previous, new: newId } = entry.changes.featuredChanged;
            
            // For each featured image ID, try to construct a valid path
            try {
              // Add path info to the featuredChanged object
              if (previous && !entry.changes.featuredChanged.previousPath) {
                // Try using the path from our database query first
                if (imagePathMap[previous]) {
                  entry.changes.featuredChanged.previousPath = imagePathMap[previous];
                } else {
                  // Fallback to a constructed path
                  entry.changes.featuredChanged.previousPath = `/images/listing/${listingId}/${previous}`;
                }
              }
              
              if (newId && !entry.changes.featuredChanged.newPath) {
                // Try using the path from our database query first
                if (imagePathMap[newId]) {
                  entry.changes.featuredChanged.newPath = imagePathMap[newId];
                } else {
                  // Fallback to a constructed path
                  entry.changes.featuredChanged.newPath = `/images/listing/${listingId}/${newId}`;
                }
              }
            } catch (e) {
              logger.error('Error enhancing featured image paths:', { e });
            }
          }
        }
        
        return entry;
      });
      
      return processedHistory;
    } catch (error) {
      logger.error('Error in getHistoryTimeline:', { error });
      throw error;
    }
  }
} 