import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { ImageService } from '@/lib/services/ImageService';

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    // Only allow image types
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Use ImageService to save the image in the realtors subdirectory
    const imagePath = await ImageService.saveImage(file as File, 'realtors');
    
    // Return the relative path for storage in DB
    return NextResponse.json({ path: imagePath });
  } catch (error) {
    console.error('Error uploading realtor photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}); 