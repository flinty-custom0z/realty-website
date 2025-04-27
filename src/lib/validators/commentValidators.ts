import { z } from 'zod';

/**
 * Zod schema for validating listing comments
 */
export const commentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000),
  listingId: z.string().min(1, "Listing ID is required"),
  userId: z.string().min(1, "User ID is required"),
  isPrivate: z.boolean().default(false),
});

export type ValidatedCommentData = z.infer<typeof commentSchema>;

/**
 * Parse and validate comment data from request JSON
 */
export function parseCommentData(data: any): ValidatedCommentData {
  return commentSchema.parse(data);
} 