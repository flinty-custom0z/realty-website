import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '@/lib/env';
import { logger } from '@/lib/logger';

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
  logger.debug(`Authentication attempt`);
  
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    logger.debug('Authentication failed');
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    logger.debug('Authentication failed');
    return null;
  }

  logger.info('Authentication successful');
  return user;
}

export function generateToken(userId: string) {
  // Avoid logging user IDs
  logger.debug(`Generating token`);
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyAuth(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      logger.debug('No token found');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    logger.info(`Token verified`);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    return user;
  } catch (error) {
    // Avoid logging full error objects
    logger.error('Token verification failed');
    return null;
  }
}

export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const user = await verifyAuth(req);
    
    if (!user) {
      logger.warn('Unauthorized access attempt', {
        path: req.nextUrl.pathname,
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Avoid logging user names
    logger.info('Authorized access', {
      userId: user.id,
      path: req.nextUrl.pathname,
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });
    (req as any).user = user;
    return handler(req, ...args);
  };
}