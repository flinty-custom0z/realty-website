import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

// Define allowed image formats and their content types
const ALLOWED_FORMATS = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

// Secure path validation to prevent directory traversal attacks
function isPathSafe(imagePath: string): boolean {
  // Check for path traversal attempts using parent directory references
  if (imagePath.includes('..') || imagePath.includes('~')) {
    return false;
  }
  
  // Check for any non-standard characters that might be used in path manipulation
  if (/[<>:"\\|?*]/.test(imagePath)) {
    return false;
  }
  
  // Only allow alphanumeric characters, dashes, underscores, periods, and forward slashes
  if (!/^[a-zA-Z0-9-_./]+$/.test(imagePath)) {
    return false;
  }
  
  return true;
}

// Verify the resolved path is within the public images directory
function isWithinImageDirectory(resolvedPath: string): boolean {
  const imagesDir = path.resolve(process.cwd(), 'public', 'images');
  return resolvedPath.startsWith(imagesDir);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const { searchParams } = new URL(request.url);
    
    // Extract resize parameters
    const width = searchParams.get('width') ? parseInt(searchParams.get('width') as string) : null;
    const height = searchParams.get('height') ? parseInt(searchParams.get('height') as string) : null;
    const quality = searchParams.get('quality') ? parseInt(searchParams.get('quality') as string) : 80;
    const format = searchParams.get('format') as keyof typeof ALLOWED_FORMATS || null;
    
    // Validate each path segment for safety
    if (!pathSegments.every(segment => isPathSafe(segment))) {
      console.error('Possible path traversal attempt detected');
      return NextResponse.json({ error: 'Invalid image path' }, { status: 400 });
    }
    
    // Construct the image path
    const imagePath = pathSegments.join('/');
    
    // Build the full path to the image
    const fullPath = path.join(process.cwd(), 'public', 'images', imagePath);
    const resolvedPath = path.resolve(fullPath);
    
    // Secondary validation: ensure the path is within the images directory
    if (!isWithinImageDirectory(resolvedPath)) {
      console.error('Path traversal attempt detected: trying to access outside of images directory');
      return NextResponse.json({ error: 'Invalid image path' }, { status: 403 });
    }
    
    // Check if file exists first to avoid errors
    if (!existsSync(resolvedPath)) {
      console.error(`Image not found: ${resolvedPath}`);
      
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
      const fileBuffer = await fs.readFile(resolvedPath);
      
      // Determine content type based on extension
      const ext = path.extname(resolvedPath).toLowerCase().substring(1);
      let contentType = ALLOWED_FORMATS[ext as keyof typeof ALLOWED_FORMATS] || 'application/octet-stream';
      
      // Skip processing for SVG files
      if (ext === 'svg') {
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
      
      // Process the image with Sharp
      let imageProcessor = sharp(fileBuffer);
      
      // Apply resizing if requested
      if (width || height) {
        imageProcessor = imageProcessor.resize({
          width: width || undefined,
          height: height || undefined,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
      
      // Convert format if requested
      if (format && ALLOWED_FORMATS[format]) {
        switch(format) {
          case 'jpeg':
          case 'jpg':
            imageProcessor = imageProcessor.jpeg({ quality });
            contentType = ALLOWED_FORMATS.jpeg;
            break;
          case 'png':
            imageProcessor = imageProcessor.png({ quality: Math.min(100, quality) });
            contentType = ALLOWED_FORMATS.png;
            break;
          case 'webp':
            imageProcessor = imageProcessor.webp({ quality });
            contentType = ALLOWED_FORMATS.webp;
            break;
          case 'avif':
            imageProcessor = imageProcessor.avif({ quality });
            contentType = ALLOWED_FORMATS.avif;
            break;
          default:
            // Keep original format, just optimize
            break;
        }
      } else {
        // Apply format-specific optimization
        switch(ext) {
          case 'jpg':
          case 'jpeg':
            imageProcessor = imageProcessor.jpeg({ quality });
            break;
          case 'png':
            imageProcessor = imageProcessor.png({ quality: Math.min(100, quality) });
            break;
          case 'webp':
            imageProcessor = imageProcessor.webp({ quality });
            break;
          case 'gif':
            // No specific optimization for GIFs
            break;
          default:
            // For unknown formats, convert to WebP for better compression
            imageProcessor = imageProcessor.webp({ quality });
            contentType = ALLOWED_FORMATS.webp;
            break;
        }
      }
      
      // Process and get the output buffer
      const processedImageBuffer = await imageProcessor.toBuffer();
      
      // Add better caching headers
      return new NextResponse(processedImageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': processedImageBuffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'Vary': 'Accept',
        },
      });
    } catch (err) {
      console.error(`Error processing image file: ${resolvedPath}`, err);
      
      // If processing fails, try to return the original as fallback
      try {
        const originalBuffer = await fs.readFile(resolvedPath);
        const ext = path.extname(resolvedPath).toLowerCase().substring(1);
        const contentType = ALLOWED_FORMATS[ext as keyof typeof ALLOWED_FORMATS] || 'application/octet-stream';
        
        return new NextResponse(originalBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } catch {
        return NextResponse.json(
          { error: 'Error reading image file' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}