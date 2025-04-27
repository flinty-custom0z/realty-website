import { z } from 'zod';

/**
 * Zod schema for validating user creation/update data
 */
export const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal('').transform(() => undefined)), // Handle empty strings in updates
  phone: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
});

/**
 * Schema for user creation, which requires a password
 */
export const userCreateSchema = userSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ValidatedUserData = z.infer<typeof userSchema>;
export type ValidatedUserCreateData = z.infer<typeof userCreateSchema>;

/**
 * Parse and validate user data from request JSON
 * For creating new users (requires password)
 */
export function parseUserCreateData(data: any): ValidatedUserCreateData {
  return userCreateSchema.parse(data);
}

/**
 * Parse and validate user data from request JSON
 * For updating existing users (password optional)
 */
export function parseUserUpdateData(data: any): ValidatedUserData {
  return userSchema.parse(data);
} 