import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { ImageService } from '@/lib/services/ImageService';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

async function handleUpload(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      throw new ApiError('No photo file provided', 400);
    }
    
    // Validate the file
    ImageService.validateImage(file);
    
    // Save the file to the realtors subdirectory
    const savedPath = await ImageService.saveImage(file, 'realtors');
    
    // Return the saved path
    return NextResponse.json({ path: savedPath });
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(handleUpload); 