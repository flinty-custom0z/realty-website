import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// PUT: Update user by id
export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const data = await req.json();
    const { name, username, password, phone, photo } = data;
    const updateData: any = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (photo !== undefined) updateData.photo = photo;
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
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// DELETE: Delete user by id
export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}); 