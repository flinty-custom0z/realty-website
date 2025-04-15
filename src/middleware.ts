// src/middleware.ts (outside app directory)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }
  
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check authentication
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      // Simple token validation without database check for performance
      // Full validation happens in the getUser function inside the admin layout
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      
      // Use a dynamic import for jsonwebtoken to avoid Edge API issues
      const jwt = await import('jsonwebtoken');
      jwt.verify(token, JWT_SECRET);
      
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // Continue for non-admin routes
  return NextResponse.next();
}

// Configure matcher for middleware to run only on admin routes
export const config = {
  matcher: '/admin/:path*',
}