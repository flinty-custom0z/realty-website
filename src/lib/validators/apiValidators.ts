import { z } from 'zod';

/**
 * Validator for pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

/**
 * Validator for ID parameters
 */
export const idSchema = z.object({
  id: z.string().min(1, "ID is required")
});

/**
 * Validator for search parameters
 */
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  filter: z.record(z.string()).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

/**
 * Parse and validate pagination params
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  return paginationSchema.parse({
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 50
  });
}

/**
 * Parse and validate ID param
 */
export function parseIdParam(id: string) {
  return idSchema.parse({ id }).id;
}

/**
 * Parse and validate search params
 */
export function parseSearchParams(searchParams: URLSearchParams) {
  const queryParam = searchParams.get('query') || '';
  if (!queryParam) {
    throw new Error('Search query is required');
  }
  
  return searchSchema.parse({
    query: queryParam,
    sort: searchParams.get('sort') || undefined,
    order: searchParams.get('order') || 'desc'
  });
} 