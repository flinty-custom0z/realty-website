import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '@/lib/env';

// Define the CookieOptions interface
interface CookieOptions {
  httpOnly?: boolean;
  path?: string;
  secure?: boolean;
  maxAge?: number;
  sameSite?: 'strict' | 'lax' | 'none';
}

// Helper function for consistent cookie settings
export function getSecureCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    sameSite: 'strict',
  };
}

export async function authenticateUser(username: string, password: string) {
  // Mask username in logs
  const maskedUsername = username.substring(0, 2) + '***';
  console.log(`Auth lib: authentication attempt`);
  
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    console.log('Auth lib: authentication failed');
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    console.log('Auth lib: authentication failed');
    return null;
  }

  console.log('Auth lib: authentication successful');
  return user;
}

export function generateToken(userId: string) {
  // Avoid logging user IDs
  console.log(`Auth lib: generating token`);
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyAuth(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      console.log('Auth lib: no token found');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log(`Auth lib: token verified`);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    return user;
  } catch (error) {
    // Avoid logging full error objects
    console.error('Auth lib: token verification failed');
    return null;
  }
}

export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const user = await verifyAuth(req);
    
    if (!user) {
      console.log('Auth lib: withAuth - unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Avoid logging user names
    console.log(`Auth lib: withAuth - authorized access`);
    (req as any).user = user;
    return handler(req, ...args);
  };
}