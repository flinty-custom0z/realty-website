import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/validators/errorHandler';

export async function POST(req: NextRequest) {
  try {
    // Create a new response
    const response = NextResponse.json({ success: true });
    
    // Clear the token cookie
    response.cookies.set({
      name: 'token',
      value: '', 
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}