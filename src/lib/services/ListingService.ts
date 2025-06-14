import prisma from '@/lib/prisma';
import { ImageService } from './ImageService';
import { HistoryService } from './HistoryService';
import { createLogger } from '@/lib/logging';
import { Listing } from '@prisma/client';

// Create a logger instance
const logger = createLogger('ListingService');

export interface ListingData {
  typeId?: string | null;
  publicDescription?: string | null;
  adminComment?: string | null;
  categoryId: string;
  userId: string;
  price: number;
  districtId?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  fullAddress?: string | null;
  floor?: number | null;
  totalFloors?: number | null;
  houseArea?: number | null;
  kitchenArea?: number | null;
  landArea?: number | null;
  condition?: string | null;
  yearBuilt?: number | null;
  buildingType?: 'BRICK' | 'PANEL' | 'MONOLITH' | 'MONOLITH_BRICK' | 'OTHER' | null;
  balconyType?: 'BALCONY' | 'LOGGIA' | 'BOTH' | 'NONE' | null;
  bathroomType?: 'COMBINED' | 'SEPARATE' | 'MULTIPLE' | null;
  windowsView?: 'COURTYARD' | 'STREET' | 'BOTH' | null;
  noEncumbrances?: boolean;
  noShares?: boolean;
  status?: string;
  dealType?: 'SALE' | 'RENT';
}

export interface ImageUploadData {
  filename: string;
  size: string;
  path: string;
  isFeatured: boolean;
}

interface DeletedImageInfo {
  id: string;
  path: string;
  isFeatured: boolean;
  error?: string;
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
  static async createListing(listingData: ListingData, currentUserId: string): Promise<Listing> {
    // Generate listing code
    const listingCode = await this.generateListingCode(listingData.categoryId);
    let title = '';
    const area = listingData.houseArea ? `${listingData.houseArea} м²` : '';

    if (listingData.typeId) {
      const propertyType = await prisma.propertyType.findUnique({
        where: { id: listingData.typeId }
      });
      if (!propertyType) {
        throw new Error('Property type not found');
      }
      title = `${propertyType.name}${area ? ` ${area}` : ''}`;
    } else {
      // No property type, use category name
      const category = await prisma.category.findUnique({ where: { id: listingData.categoryId } });
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Use singular form "Новостройка" for new-construction category
      let categoryName = category.name;
      if (category.slug === 'new-construction') {
        categoryName = 'Новостройка';
      } else if (category.slug === 'international') {
        categoryName = 'Недвижимость за рубежом';
      }
      
      title = `${categoryName}${area ? ` ${area}` : ''}`;
    }

    // Use transaction to ensure atomic creation of listing and history record
    return prisma.$transaction(async (tx) => {
      // Create listing within transaction
      const newListing = await tx.listing.create({
        data: {
          ...listingData,
          title,
          listingCode,
          status: listingData.status || 'active',
        },
      });
      // Create history entry for creation within the same transaction
      await tx.listingHistory.create({
        data: {
          listingId: newListing.id,
          userId: currentUserId,
          changes: { action: 'create', data: { ...listingData, title, listingCode } },
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
  ): Promise<Listing> {
    // Get the original listing before changes for history tracking
    const originalListing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        propertyType: true
      }
    });
    
    if (!originalListing) {
      throw new Error('Listing not found');
    }
    
    let propertyType = originalListing.propertyType;
    let title = '';
    const area = listingData.houseArea !== undefined ? 
      `${listingData.houseArea} м²` : 
      (originalListing.houseArea ? `${originalListing.houseArea} м²` : '');
    
    if (listingData.typeId) {
      propertyType = await prisma.propertyType.findUnique({
        where: { id: listingData.typeId }
      });
      
      if (!propertyType) {
        throw new Error('Property type not found');
      }
      title = `${propertyType.name}${area ? ` ${area}` : ''}`;
    } else {
      // No property type, use category name
      const category = await prisma.category.findUnique({ where: { id: listingData.categoryId } });
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Use singular form "Новостройка" for new-construction category
      let categoryName = category.name;
      if (category.slug === 'new-construction') {
        categoryName = 'Новостройка';
      } else if (category.slug === 'international') {
        categoryName = 'Недвижимость за рубежом';
      }
      
      title = `${categoryName}${area ? ` ${area}` : ''}`;
    }
    
    // Track changes for history
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    
    // Compare and record changes
    Object.entries(listingData).forEach(([key, newValue]) => {
      const oldValue = (originalListing as Record<string, unknown>)[key];
      
      // Only record if the value has actually changed
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          old: oldValue,
          new: newValue
        };
      }
    });
    
    // Add title to changes if it changed
    if (title !== originalListing.title) {
      changes.title = {
        old: originalListing.title,
        new: title
      };
    }

    // Use transaction to ensure atomic update of listing and history record
    return prisma.$transaction(async (tx) => {
      // Update listing
      const updatedListing = await tx.listing.update({
        where: { id: listingId },
        data: {
          ...listingData,
          title
        },
      });

      // Convert changes to a simple object structure for JSON serialization
      const changesForHistory: { action: string; fields: Record<string, { old: unknown; new: unknown }> } = {
        action: 'update_fields',
        fields: {}
      };
      
      // Convert the complex changes object to a simpler structure
      Object.entries(changes).forEach(([key, value]) => {
        changesForHistory.fields[key] = {
          old: JSON.parse(JSON.stringify(value.old)),
          new: JSON.parse(JSON.stringify(value.new))
        };
      });
      
      await tx.listingHistory.create({
        data: {
          listingId,
          userId: currentUserId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          changes: changesForHistory as any,
          action: 'update'
        }
      });

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
        propertyType: true
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
              propertyType: listing.propertyType?.name || 'Unknown',
              category: listing.category.name,
              price: listing.price,
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
      // Get the current featured image before upload
      const previousFeatured = await prisma.image.findFirst({
        where: { listingId, isFeatured: true }
      });

      // Second phase: Create DB records in a transaction
      await prisma.$transaction(async (tx) => {
        // Create image records in database
        for (let i = 0; i < uploadedFilesPaths.length; i++) {
          const path = uploadedFilesPaths[i];
          const file = imageFiles.find(f => f instanceof File) as File;
          const isFeatured = i === 0; // First image is featured
          await tx.image.create({
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

        // Get the new featured image after upload
        const newFeatured = await tx.image.findFirst({
          where: { listingId, isFeatured: true }
        });
        
        // More accurate featured image change detection
        let featuredChanged = false;
        
        // Case 1: One exists but the other doesn't
        if ((!previousFeatured && newFeatured) || (previousFeatured && !newFeatured)) {
          featuredChanged = true;
        } 
        // Case 2: Both exist but with different IDs or paths
        else if (previousFeatured && newFeatured) {
          // First try ID comparison
          if (previousFeatured.id !== newFeatured.id) {
            featuredChanged = true;
          } 
          // Fallback to path comparison if IDs match but paths don't
          else if (previousFeatured.path !== newFeatured.path) {
            featuredChanged = true;
          }
        }

        // Record image uploads in history within the transaction
        await tx.listingHistory.create({
          data: {
            listingId,
            userId: currentUserId,
            changes: {
              added: uploadedImagesData.map(img => {
                let imagePath = img.path;
                if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                  imagePath = `/${imagePath}`;
                }
                return {
                  filename: img.filename,
                  size: img.size,
                  path: imagePath
                };
              }),
              ...(featuredChanged && newFeatured && previousFeatured ? {
                featuredChanged: {
                  previous: previousFeatured.id,
                  new: newFeatured.id,
                  previousPath: previousFeatured.path,
                  newPath: newFeatured.path
                }
              } : {})
            },
            action: 'images'
          }
        });
      });
      
      return uploadedImagesData;
    } catch (error) {
      logger.error('Error creating image database records:', { error });
      
      // If database operation fails, clean up the uploaded files
      for (const path of uploadedFilesPaths) {
        try {
          await ImageService.deleteImage(path);
        } catch (cleanupError) {
          logger.error(`Failed to clean up image ${path}:`, { cleanupError });
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
  ): Promise<DeletedImageInfo[]> {
    if (imageIds.length === 0) return [];
    
    // Get details of images to be deleted for history
    const imagesToDelete = await prisma.image.findMany({
      where: { 
        id: { in: imageIds },
        listingId // Ensure we only delete images that belong to this listing
      }
    });
    
    if (imagesToDelete.length === 0) return [];
    
    const deletedImages: DeletedImageInfo[] = [];
    
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
            deleted: imagesToDelete.map(img => {
              // Ensure path is properly formatted for frontend display
              let imagePath = img.path;
              if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                imagePath = `/${imagePath}`;
              }
              
              return {
                id: img.id,
                path: imagePath,
                isFeatured: img.isFeatured
              };
            })
          },
          action: 'images'
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
        logger.error(`Error deleting image file ${image.path}:`, { error });
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
    
    // Get current featured image before updating
    const currentFeaturedImage = await prisma.image.findFirst({
      where: {
        listingId,
        isFeatured: true
      }
    });
    
    // Check if this is actually a change or the same image
    if (currentFeaturedImage?.id === featuredImageId) {
      // No change needed, it's already the featured image
      return true;
    }
    
    // Store the previous featured image path for history
    const previousFeaturedPath = currentFeaturedImage?.path || null;
    
    // Update the featured image
    await ImageService.updateFeaturedImage(listingId, featuredImageId);
    
    // Record the change in history
    await HistoryService.recordImageChanges(
      listingId,
      currentUserId,
      [], // no added images
      [], // no deleted images
      true, // featured image changed
      image.path, // new featured image path
      previousFeaturedPath // previous featured image path
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
    dealType?: string | null;
  }) {
    const { page = 1, limit = 50, categorySlug = null, status = null, dealType = null } = params;
    
    // Create a filter object starting with all listings
    const filter: Record<string, unknown> = {};
    
    // Add category filter if provided
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
    
    if (dealType) {
      filter.dealType = dealType.toUpperCase();
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: filter,
        include: {
          category: true,
          propertyType: true,
          city: true,
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
        propertyType: true,
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
  static async getFilteredListings(filterParams: {
    categoryParams?: string[];
    searchQuery?: string | null;
    minPrice?: string | null;
    maxPrice?: string | null;
    districts?: string[];
    conditions?: string[];
    dealType?: string | null;
    propertyTypes?: string[];
    cityIds?: string[];
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const { 
      categoryParams = [], 
      searchQuery = null,
      minPrice = null, 
      maxPrice = null, 
      districts = [], 
      conditions = [], 
      dealType = null,
      propertyTypes = [],
      cityIds = [],
      page = 1,
      limit = 12,
      sort = 'dateAdded',
      order = 'desc'
    } = filterParams;
    
    // Build filter for active listings
    const filter: Record<string, unknown> = { status: 'active' };
    
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
    
    // Add property type filter if provided
    if (propertyTypes.length > 0) {
      filter.typeId = { in: propertyTypes };
    }
    
    // Add search query if provided
    if (searchQuery) {
      filter.OR = [
        { propertyType: { name: { contains: searchQuery, mode: 'insensitive' } } },
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
      filter.districtId = { in: districts };
    }
    
    // Add condition filter if provided
    if (conditions.length > 0) {
      filter.condition = { in: conditions };
    }
    
    // Add deal type filter if provided
    if (dealType === 'rent') {
      filter.dealType = 'RENT';
    } else if (dealType === 'sale') {
      filter.dealType = 'SALE';
    }
    
    // Add city filter if provided
    if (cityIds.length > 0) {
      filter.cityId = { in: cityIds };
    }
    
    // Count total listings with filter
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: filter,
        include: {
          category: true,
          propertyType: true,
          images: true,
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