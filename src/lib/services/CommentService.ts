import prisma from '@/lib/prisma';

export interface CommentData {
  listingId: string;
  content: string;
}

export class CommentService {
  /**
   * Creates a new comment for a listing
   */
  static async createComment(data: CommentData) {
    return prisma.comment.create({
      data: {
        listingId: data.listingId,
        content: data.content,
      },
    });
  }

  /**
   * Gets all comments for a listing
   */
  static async getCommentsByListingId(listingId: string) {
    return prisma.comment.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gets a single comment by ID
   */
  static async getCommentById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
    });
  }

  /**
   * Updates an existing comment
   */
  static async updateComment(id: string, content: string) {
    return prisma.comment.update({
      where: { id },
      data: { content },
    });
  }

  /**
   * Deletes a comment by ID
   */
  static async deleteComment(id: string) {
    return prisma.comment.delete({
      where: { id },
    });
  }
} 