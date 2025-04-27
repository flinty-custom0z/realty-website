import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/validators/errorHandler';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    
    if (!user) {
      return NextResponse.json({ isAuthenticated: false, user: null });
    }
    
    // Return only necessary user data
    return NextResponse.json({ 
      isAuthenticated: true, 
      user: {
        id: user.id,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}