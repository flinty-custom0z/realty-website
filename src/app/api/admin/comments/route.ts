import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { CommentService } from '@/lib/services/CommentService';

// Create comment (admin only)
async function handleCreateComment(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    const { listingId, content } = body;

    // Use CommentService to create the comment
    const comment = await CommentService.createComment({
      listingId,
      content
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ 
      error: 'Error creating comment',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export const POST = withAuth(handleCreateComment);