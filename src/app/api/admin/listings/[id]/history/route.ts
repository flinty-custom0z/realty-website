import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';

// GET listing history
async function getListingHistory(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID in request' }, { status: 400 });
    }
    
    // Fetch listing history with user details
    const history = await prisma.$queryRaw`
      SELECT 
        lh.id, 
        lh."createdAt", 
        lh.action, 
        lh.changes,
        u.name as "userName"
      FROM "ListingHistory" lh
      JOIN "User" u ON lh."userId" = u.id
      WHERE lh."listingId" = ${id}
      ORDER BY lh."createdAt" DESC
    `;
    
    // First, get all images for this listing to use in path construction
    let listingImages: any[] = [];
    try {
      listingImages = await prisma.image.findMany({
        where: { listingId: id }
      });
    } catch (e) {
      console.log('Error fetching listing images:', e);
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
                  path: `/images/listing/${id}/${imageId}`
                };
              }
              
              // If we can't extract an ID, try using the filename as path
              return {
                ...img,
                path: `/images/listing/${id}/${img.filename.replace(/\s+/g, '-')}`
              };
            }
            return img;
          });
        }
        
        // Process featured image changes
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
                entry.changes.featuredChanged.previousPath = `/images/listing/${id}/${previous}`;
              }
            }
            
            if (newId && !entry.changes.featuredChanged.newPath) {
              // Try using the path from our database query first
              if (imagePathMap[newId]) {
                entry.changes.featuredChanged.newPath = imagePathMap[newId];
              } else {
                // Fallback to a constructed path
                entry.changes.featuredChanged.newPath = `/images/listing/${id}/${newId}`;
              }
            }
          } catch (e) {
            console.log('Error enhancing featured image paths:', e);
          }
        }
      }
      
      return entry;
    });
    
    return NextResponse.json(processedHistory);
  } catch (error) {
    console.error('Error fetching listing history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getListingHistory); 