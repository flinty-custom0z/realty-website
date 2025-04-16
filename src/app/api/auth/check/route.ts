import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

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
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 500 });
  }
}