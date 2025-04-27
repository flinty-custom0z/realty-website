import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { CommentService } from '@/lib/services/CommentService';
import { parseCommentData } from '@/lib/validators/commentValidators';
import { handleApiError } from '@/lib/validators/errorHandler';

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
    return handleApiError(error);
  }
}

// Get comments for listing (admin only)
async function handleGetComments(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }
    
    const comments = await CommentService.getCommentsByListingId(listingId);
    return NextResponse.json(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(handleCreateComment);
export const GET = withAuth(handleGetComments);