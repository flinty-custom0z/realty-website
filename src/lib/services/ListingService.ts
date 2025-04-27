import prisma from '@/lib/prisma';
import { ImageService } from './ImageService';
import { HistoryService } from './HistoryService';
import { createLogger } from '@/lib/logging';

// Create a logger instance
const logger = createLogger('ListingService');

export interface ListingData {
  title: string;
  publicDescription?: string | null;
  adminComment?: string | null;
  categoryId: string;
  userId: string;
  price: number;
  district?: string | null;
  address?: string | null;
  rooms?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  houseArea?: number | null;
  landArea?: number | null;
  condition?: string | null;
  yearBuilt?: number | null;
  noEncumbrances?: boolean;
  noKids?: boolean;
  status?: string;
  dealType?: 'SALE' | 'RENT';
}

export interface ImageUploadData {
  filename: string;
  size: string;
  path: string;
  isFeatured: boolean;
}

export class ListingService {
  /**
   * Generates a unique listing code based on category and random number
   */
  static async generateListingCode(categoryId: string): Promise<string> {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    const prefix = category ? category.name.charAt(0).toUpperCase() : 'X';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}`;
  }

  /**
   * Creates a new listing
   */
  static async createListing(listingData: ListingData, currentUserId: string): Promise<any> {
    // Generate listing code
    const listingCode = await this.generateListingCode(listingData.categoryId);
    
    // Use transaction to ensure atomic creation of listing and history record
    return prisma.$transaction(async (tx) => {
      // Create listing within transaction
      const newListing = await tx.listing.create({
        data: {
          ...listingData,
          listingCode,
          status: listingData.status || 'active',
        },
      });
      
      // Create history entry for creation within the same transaction
      await tx.listingHistory.create({
        data: {
          listingId: newListing.id,
          userId: currentUserId,
          changes: { action: 'create', data: { ...listingData, listingCode } },
          action: 'create'
        }
      });
      
      return newListing;
    });
  }

  /**
   * Updates an existing listing
   */
  static async updateListing(
    listingId: string, 
    listingData: ListingData, 
    currentUserId: string
  ): Promise<any> {
    // Get the original listing before changes for history tracking
    const originalListing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        title: true,
        publicDescription: true,
        adminComment: true,
        categoryId: true,
        district: true,
        address: true,
        rooms: true,
        floor: true,
        totalFloors: true,
        houseArea: true,
        landArea: true,
        condition: true,
        yearBuilt: true,
        noEncumbrances: true,
        noKids: true,
        price: true,
        status: true,
        userId: true,
      }
    });

    if (!originalListing) {
      throw new Error('Listing not found');
    }

    // Compare fields to identify what has changed
    const changes: Record<string, { from: any, to: any }> = {};
    Object.keys(listingData).forEach(key => {
      if (key in originalListing && originalListing[key as keyof typeof originalListing] !== listingData[key as keyof typeof listingData]) {
        changes[key] = {
          from: originalListing[key as keyof typeof originalListing],
          to: listingData[key as keyof typeof listingData]
        };
      }
    });

    // Use transaction to ensure atomic update of listing and history record
    return prisma.$transaction(async (tx) => {
      // Update listing
      const updatedListing = await tx.listing.update({
        where: { id: listingId },
        data: listingData,
      });

      // Only create history entry if there were actual changes
      if (Object.keys(changes).length > 0) {
        await tx.listingHistory.create({
          data: {
            listingId,
            userId: currentUserId,
            changes: {
              action: 'update_fields',
              fields: changes
            },
            action: 'update'
          }
        });
      }

      return updatedListing;
    });
  }

  /**
   * Deletes a listing and its associated images
   */
  static async deleteListing(listingId: string, currentUserId: string): Promise<boolean> {
    // Get the listing to be deleted
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        images: true,
        category: true,
        user: {
          select: {
            name: true,
          }
        }
      },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // First record deletion in history and delete database records in a transaction
    await prisma.$transaction(async (tx) => {
      // Create history entry for deletion
      await tx.listingHistory.create({
        data: {
          listingId,
          userId: currentUserId,
          changes: {
            message: "Listing deleted",
            details: {
              title: listing.title,
              category: listing.category.name,
              price: listing.price,
              realtorName: listing.user.name,
              listingCode: listing.listingCode,
              imageCount: listing.images.length
            }
          },
          action: 'delete'
        }
      });

      // Delete the listing (which will cascade to delete related images from the database)
      await tx.listing.delete({
        where: { id: listingId },
      });
    });

    // After successful database transaction, delete the images from disk
    // Even if some image deletions fail, the database is already cleaned up
    const imageDeletePromises = listing.images.map(async (image) => {
      try {
        return await ImageService.deleteImage(image.path);
      } catch (error) {
        logger.error(`Failed to delete image file ${image.path}`, { error });
        return false;
      }
    });

    // Wait for all image deletions to complete, but don't fail if some fail
    await Promise.allSettled(imageDeletePromises);

    return true;
  }

  /**
   * Processes image uploads for a listing
   */
  static async processImageUploads(
    listingId: string, 
    imageFiles: File[], 
    currentUserId: string
  ): Promise<ImageUploadData[]> {
    if (imageFiles.length === 0) return [];
    
    const uploadedImagesData: ImageUploadData[] = [];
    const uploadedFilesPaths: string[] = [];
    
    // First phase: Upload files to disk
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file instanceof File) {
        try {
          const imagePath = await ImageService.saveImage(file);
          uploadedFilesPaths.push(imagePath);
        } catch (error) {
          logger.error(`Error saving image ${file.name} to disk`, { error });
          // Continue trying to save other images
        }
      }
    }
    
    // If no images were successfully saved to disk, return early
    if (uploadedFilesPaths.length === 0) return [];

    try {
      // Second phase: Create DB records in a transaction
      await prisma.$transaction(async (tx) => {
        // Create image records in database
        for (let i = 0; i < uploadedFilesPaths.length; i++) {
          const path = uploadedFilesPaths[i];
          const file = imageFiles.find(f => f instanceof File) as File;
          const isFeatured = i === 0; // First image is featured
          
          // Create the image record
          const imageRecord = await tx.image.create({
            data: {
              listingId,
              path,
              isFeatured
            }
          });
          
          uploadedImagesData.push({
            filename: file?.name || 'unknown',
            size: file ? Math.round(file.size / 1024) + 'KB' : 'unknown',
            path,
            isFeatured
          });
        }
        
        // Record image uploads in history within the transaction
        await tx.listingHistory.create({
          data: {
            listingId,
            userId: currentUserId,
            changes: { 
              action: 'upload_images',
              imageCount: uploadedImagesData.length,
              images: uploadedImagesData.map(img => ({ path: img.path, isFeatured: img.isFeatured }))
            },
            action: 'update'
          }
        });
      });
      
      return uploadedImagesData;
    } catch (error) {
      logger.error('Error creating image database records:', error);
      
      // If database operation fails, clean up the uploaded files
      for (const path of uploadedFilesPaths) {
        try {
          await ImageService.deleteImage(path);
        } catch (cleanupError) {
          logger.error(`Failed to clean up image ${path}:`, cleanupError);
        }
      }
      
      return [];
    }
  }

  /**
   * Handles deleting images from a listing
   */
  static async deleteImages(
    listingId: string, 
    imageIds: string[], 
    currentUserId: string
  ): Promise<any[]> {
    if (imageIds.length === 0) return [];
    
    // Get details of images to be deleted for history
    const imagesToDelete = await prisma.image.findMany({
      where: { 
        id: { in: imageIds },
        listingId // Ensure we only delete images that belong to this listing
      }
    });
    
    if (imagesToDelete.length === 0) return [];
    
    const deletedImages = [];
    
    // First: Delete database records in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete image records from database
      await tx.image.deleteMany({
        where: {
          id: { in: imagesToDelete.map(img => img.id) }
        }
      });
      
      // Record image deletions in history
      await tx.listingHistory.create({
        data: {
          listingId,
          userId: currentUserId,
          changes: {
            action: 'delete_images',
            imageCount: imagesToDelete.length,
            images: imagesToDelete.map(img => ({ 
              id: img.id, 
              path: img.path, 
              isFeatured: img.isFeatured 
            }))
          },
          action: 'update'
        }
      });
    });
    
    // Then: Delete the actual image files from disk
    for (const image of imagesToDelete) {
      try {
        // Delete the image file from disk
        await ImageService.deleteImage(image.path);
        
        deletedImages.push({
          id: image.id,
          path: image.path,
          isFeatured: image.isFeatured
        });
      } catch (error) {
        logger.error(`Error deleting image file ${image.path}:`, error);
        // Add to deleted images anyway since the DB record is gone
        deletedImages.push({
          id: image.id,
          path: image.path,
          isFeatured: image.isFeatured,
          error: 'File deletion failed but database record was removed'
        });
      }
    }
    
    return deletedImages;
  }

  /**
   * Updates the featured image for a listing
   */
  static async updateFeaturedImage(
    listingId: string, 
    featuredImageId: string, 
    currentUserId: string
  ): Promise<boolean> {
    // First check if the image exists and belongs to this listing
    const image = await prisma.image.findFirst({
      where: { 
        id: featuredImageId,
        listingId
      }
    });
    
    if (!image) {
      return false;
    }
    
    // Update the featured image
    await ImageService.updateFeaturedImage(listingId, featuredImageId);
    
    // Record the change in history
    await HistoryService.recordImageChanges(
      listingId,
      currentUserId,
      [], // no added images
      [], // no deleted images
      true, // featured image changed
      image.path // new featured image path
    );
    
    return true;
  }

  /**
   * Gets all listings with filtering and pagination
   */
  static async getAllListings(params: {
    page?: number;
    limit?: number;
    categorySlug?: string | null;
    status?: string | null;
  }) {
    const { 
      page = 1, 
      limit = 50, 
      categorySlug = null, 
      status = null 
    } = params;
    
    // Build filter
    const filter: any = {};
    
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        filter.categoryId = category.id;
      }
    }
    
    if (status) {
      filter.status = status;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: filter,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            where: { isFeatured: true },
            take: 1,
          },
          _count: {
            select: {
              images: true,
              comments: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateAdded: 'desc' },
      }),
      prisma.listing.count({ where: filter }),
    ]);

    return {
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Gets a single listing by ID
   */
  static async getListingById(id: string) {
    return prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        images: true,
      },
    });
  }

  /**
   * Gets a listing with all relationships
   */
  static async getListingByIdWithRelations(id: string) {
    return prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            images: true,
            comments: true,
          },
        },
      },
    });
  }

  /**
   * Gets filtered listings for public site with pagination
   */
  static async getFilteredListings(filterParams: any) {
    const { 
      categoryParams = [], 
      searchQuery = null,
      minPrice = null, 
      maxPrice = null, 
      districts = [], 
      conditions = [], 
      rooms = [],
      dealType = null,
      page = 1,
      limit = 12,
      sort = 'dateAdded',
      order = 'desc'
    } = filterParams;
    
    // Build filter for active listings
    const filter: any = { status: 'active' };
    
    // Add category filter if provided
    if (categoryParams.length > 0) {
      const cats = await prisma.category.findMany({
        where: { slug: { in: categoryParams } },
        select: { id: true }
      });
      if (cats.length > 0) {
        filter.categoryId = { in: cats.map(c => c.id) };
      }
    }
    
    // Add search query if provided
    if (searchQuery) {
      filter.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { publicDescription: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }
    
    // Add price range filter if provided
    if (minPrice) {
      filter.price = { ...(filter.price || {}), gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      filter.price = { ...(filter.price || {}), lte: parseFloat(maxPrice) };
    }
    
    // Add district filter if provided
    if (districts.length > 0) {
      filter.district = { in: districts };
    }
    
    // Add condition filter if provided
    if (conditions.length > 0) {
      filter.condition = { in: conditions };
    }
    
    // Add rooms filter if provided
    if (rooms.length > 0) {
      filter.rooms = { in: rooms.map((r: string) => parseInt(r)).filter((r: number) => !isNaN(r)) };
    }
    
    // Add deal type filter if provided
    if (dealType === 'rent') {
      filter.dealType = 'RENT';
    } else if (dealType === 'sale') {
      filter.dealType = 'SALE';
    }
    
    // Count total listings with filter
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: filter,
        include: {
          category: true,
          images: {
            where: { isFeatured: true },
            take: 1
          }
        },
        orderBy: { [sort]: order === 'asc' ? 'asc' : 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.listing.count({ where: filter })
    ]);
    
    return {
      listings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }
} 