import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  // Skip if requesting static files completely
  if (request.nextUrl.pathname.startsWith('/images/')) {
    return NextResponse.next();
  }
  
  // Skip login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }
  
  // Only apply auth check to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check authentication
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      // Simple token validation without database check for performance
      const encoder = new TextEncoder();
      await jwtVerify(token, encoder.encode(JWT_SECRET));
      return NextResponse.next();
    } catch (error) {
      console.error('Invalid token:', error);
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // Continue for non-admin routes
  return NextResponse.next();
}

// Updated matcher to specifically exclude images and static files
export const config = {
  matcher: [
    // Exclude static files and api routes for images
    '/((?!images/|_next/|favicon.ico).*)',
    // But include admin routes
    '/admin/:path*'
  ],
};