import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imagePath = searchParams.get('path');
    
    if (!imagePath) {
      throw new ApiError('No path provided', 400);
    }
    
    // Remove leading slash if present
    const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const fullPath = path.join(process.cwd(), 'public', normalizedPath);
    
    try {
      await fs.access(fullPath);
      const stats = await fs.stat(fullPath);
      return NextResponse.json({ 
        exists: true, 
        size: stats.size,
        path: fullPath
      });
    } catch {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    return handleApiError(error);
  }
}