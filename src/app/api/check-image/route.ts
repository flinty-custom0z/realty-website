import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imagePath = searchParams.get('path');
    
    if (!imagePath) {
      return NextResponse.json({ exists: false, error: 'No path provided' }, { status: 400 });
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
    console.error('Error checking image:', error);
    return NextResponse.json({ exists: false, error: 'Server error' }, { status: 500 });
  }
}