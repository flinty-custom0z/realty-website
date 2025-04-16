import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    // Reconstruct the path
    const imagePath = pathSegments.join('/');
    
    // Build the full path to the image
    const fullPath = path.join(process.cwd(), 'public', 'images', imagePath);
    
    try {
      // Read the file
      const fileBuffer = await fs.readFile(fullPath);
      
      // Determine content type based on extension
      const ext = path.extname(fullPath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      
      // Return the image
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (err) {
      console.error(`Error reading image file: ${fullPath}`, err);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
