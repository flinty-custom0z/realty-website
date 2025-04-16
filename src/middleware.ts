import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      // Simple token validation without database check for performance
      // Full validation happens in the getUser function inside the admin layout
      const encoder = new TextEncoder();
      
      await jwtVerify(token, encoder.encode(JWT_SECRET));
      
      return NextResponse.next();
    } catch (error) {
      console.error('Invalid token:', error);
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // For static file requests, let them through directly
  if (request.nextUrl.pathname.startsWith('/images/')) {
    return NextResponse.next();
  }
  
  // Continue for non-admin routes
  return NextResponse.next();
}

// Configure matcher for middleware to run only on admin routes and image paths
export const config = {
  matcher: ['/admin/:path*', '/images/:path*'],
};