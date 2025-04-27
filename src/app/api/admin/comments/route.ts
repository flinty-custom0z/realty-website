import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { CommentService } from '@/lib/services/CommentService';
import { parseCommentData } from '@/lib/validators/commentValidators';
import { handleValidationError } from '@/lib/validators/errorHandler';

// Create comment (admin only)
async function handleCreateComment(req: NextRequest, user: any) {
  try {
    const body = await req.json();
    
    // Validate the comment data using Zod
    const validatedData = parseCommentData({
      ...body,
      userId: user.id // Add the current user's ID
    });

    // Use CommentService to create the comment
    const comment = await CommentService.createComment({
      listingId: validatedData.listingId,
      content: validatedData.content
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleValidationError(error);
  }
}

export const POST = withAuth(handleCreateComment);