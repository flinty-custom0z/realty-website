import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function authenticateUser(username: string, password: string) {
  console.log(`Auth lib: authenticating ${username}`);
  
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    console.log('Auth lib: user not found');
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    console.log('Auth lib: password does not match');
    return null;
  }

  console.log('Auth lib: authentication successful');
  return user;
}

export function generateToken(userId: string) {
  console.log(`Auth lib: generating token for user ${userId}`);
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyAuth(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      console.log('Auth lib: no token found');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log(`Auth lib: token verified for user id ${decoded.id}`);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    return user;
  } catch (error) {
    console.error('Auth lib: token verification failed', error);
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
    
    console.log(`Auth lib: withAuth - authorized access for ${user.name}`);
    (req as any).user = user;
    return handler(req, ...args);
  };
}