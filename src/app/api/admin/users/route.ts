import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import * as bcrypt from 'bcrypt';
import { parseUserCreateData } from '@/lib/validators/userValidators';
import { handleApiError } from '@/lib/validators/errorHandler';

// GET: List all users (realtors)
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error);
  }
});

// POST: Create a new user (realtor)
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    // Validate input data using Zod
    const validatedData = parseUserCreateData(data);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: { 
        name: validatedData.name, 
        username: validatedData.username, 
        password: hashedPassword, 
        phone: validatedData.phone, 
        photo: validatedData.photo 
      },
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}); 