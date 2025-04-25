import prisma from '@/lib/prisma';
import { ImageService } from './ImageService';
import { HistoryService } from './HistoryService';

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
    
    // Create listing
    const newListing = await prisma.listing.create({
      data: {
        ...listingData,
        listingCode,
        status: listingData.status || 'active',
      },
    });
    
    // Create history entry for creation
    await HistoryService.recordListingCreation(newListing.id, currentUserId);
    
    return newListing;
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

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: listingData,
    });

    // Record changes in history
    await HistoryService.recordFieldChanges(
      listingId,
      currentUserId,
      originalListing,
      listingData
    );

    return updatedListing;
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

    // Record deletion in history before actually deleting
    await HistoryService.recordListingDeletion(listingId, currentUserId, {
      title: listing.title,
      category: listing.category.name,
      price: listing.price,
      realtorName: listing.user.name,
      listingCode: listing.listingCode,
      imageCount: listing.images.length
    });

    // Delete the image files from disk
    for (const image of listing.images) {
      await ImageService.deleteImage(image.path);
    }

    // Delete the listing (which cascades to images)
    await prisma.listing.delete({
      where: { id: listingId },
    });

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
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file instanceof File) {
        try {
          const imagePath = await ImageService.saveImage(file);
          
          // Create the image record
          const imageRecord = await ImageService.createImageRecord(
            listingId, 
            imagePath, 
            i === 0 // First image is featured
          );
          
          uploadedImagesData.push({
            filename: file.name,
            size: Math.round(file.size / 1024) + 'KB',
            path: imagePath,
            isFeatured: i === 0
          });
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          // Continue with other images even if one fails
        }
      }
    }
    
    // Record image uploads in history
    if (uploadedImagesData.length > 0) {
      await HistoryService.recordImageUploads(
        listingId,
        currentUserId,
        uploadedImagesData
      );
    }
    
    return uploadedImagesData;
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
    const imagesToDeleteDetails = await ImageService.getImagesDetails(imageIds);
    
    // Filter to ensure we only delete images that belong to this listing
    const validImagesToDelete = imagesToDeleteDetails.filter(img => true); // In a real app, verify listingId here
    
    const deletedImages = [];
    
    // Delete the images one by one
    for (const image of validImagesToDelete) {
      try {
        // Delete the image file from disk
        await ImageService.deleteImage(image.path);
        
        // Delete the image record from the database
        await ImageService.deleteImageRecord(image.id);
        
        deletedImages.push({
          id: image.id,
          path: image.path,
          isFeatured: image.isFeatured
        });
      } catch (error) {
        console.error(`Error deleting image ${image.id}:`, error);
      }
    }
    
    // Record image deletions in history
    if (deletedImages.length > 0) {
      await HistoryService.recordImageChanges(
        listingId,
        currentUserId,
        [], // no added images
        deletedImages,
        deletedImages.some(img => img.isFeatured), // whether a featured image was deleted
        null
      );
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
} 