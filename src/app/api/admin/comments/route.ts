import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// Create comment (admin only)
async function handleCreateComment(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { listingId, content } = body;

    const comment = await prisma.comment.create({
      data: {
        listingId,
        content,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(handleCreateComment);