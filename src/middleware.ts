import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow image/static file requests through
  if (pathname.startsWith('/images/') || pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  
  // Skip auth check for login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }
  
  // Check admin auth
  if (pathname.startsWith('/admin')) {
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
  
  // Allow all other requests
  return NextResponse.next();
}

// Exclude login and public paths from auth check
export const config = {
  matcher: [
    '/admin((?!/login).*)', // include all /admin routes EXCEPT /admin/login
  ],
};
