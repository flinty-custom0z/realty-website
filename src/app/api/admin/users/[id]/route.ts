import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import * as bcrypt from 'bcrypt';
import { parseUserUpdateData } from '@/lib/validators/userValidators';
import { handleApiError, ApiError } from '@/lib/validators/errorHandler';

// GET: Get user by id
export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
    if (!user) throw new ApiError('User not found', 404);
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
});

// PUT: Update user
export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const data = await req.json();
    const validatedData = parseUserUpdateData(data);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });
    
    if (!existingUser) {
      throw new ApiError('User not found', 404);
    }
    
    // If password is being updated, hash it
    let updateData = { ...validatedData };
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10);
    }
    
    // Update the user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
    
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
});

// DELETE: Delete user by id
export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}); 