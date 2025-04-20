import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

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
    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'realtors');
    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    // Return the relative path for storage in DB
    return NextResponse.json({ path: `/images/realtors/${filename}` });
  } catch (error) {
    console.error('Error uploading realtor photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}); 