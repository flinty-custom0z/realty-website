import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import * as bcrypt from 'bcrypt';
import { parseUserUpdateData } from '@/lib/validators/userValidators';
import { handleValidationError } from '@/lib/validators/errorHandler';

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
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return handleValidationError(error);
  }
});

// PUT: Update user by id
export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const data = await req.json();
    
    // Validate input data using Zod
    const validatedData = parseUserUpdateData(data);
    
    // Build update data object
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.username) updateData.username = validatedData.username;
    if (validatedData.password) {
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      updateData.password = hashedPassword;
    }
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.photo !== undefined) updateData.photo = validatedData.photo;
    
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
    return handleValidationError(error);
  }
});

// DELETE: Delete user by id
export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleValidationError(error);
  }
}); 