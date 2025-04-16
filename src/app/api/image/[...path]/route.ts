import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

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
    
    // Check if file exists first to avoid errors
    if (!existsSync(fullPath)) {
      console.error(`Image not found: ${fullPath}`);
      
      // Get default placeholder path
      const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder.png');
      
      // If placeholder exists, return it
      if (existsSync(placeholderPath)) {
        const placeholderBuffer = await fs.readFile(placeholderPath);
        return new NextResponse(placeholderBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
      
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
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
      else if (ext === '.webp') contentType = 'image/webp';
      
      // Add better caching headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': fileBuffer.length.toString(),
          'Accept-Ranges': 'bytes',
        },
      });
    } catch (err) {
      console.error(`Error reading image file: ${fullPath}`, err);
      return NextResponse.json(
        { error: 'Error reading image file' },
        { status: 500 }
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