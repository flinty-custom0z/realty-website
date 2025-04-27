import { z } from 'zod';
import { ListingData } from '../services/ListingService';

/**
 * Zod schema for validating listing data
 */
export const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  publicDescription: z.string().min(1, "Description is required"),
  adminComment: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  district: z.string().min(1, "District is required"),
  address: z.string().min(1, "Address is required"),
  rooms: z.number().int().nonnegative().nullable().optional(),
  floor: z.number().int().nonnegative().nullable().optional(),
  totalFloors: z.number().int().nonnegative().nullable().optional(),
  houseArea: z.number().nonnegative().nullable().optional(),
  landArea: z.number().nonnegative().nullable().optional(),
  condition: z.string().optional().nullable(),
  yearBuilt: z.number().int().positive().nullable().optional(),
  noEncumbrances: z.boolean().default(false),
  noKids: z.boolean().default(false),
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["active", "sold", "pending", "inactive"]).default("active"),
});

export type ValidatedListingData = z.infer<typeof listingSchema>;

/**
 * Safely parses and validates form data for a listing using Zod
 * Throws a ZodError if validation fails
 */
export function parseListingFormData(formData: FormData): ListingData {
  // Extract listing data from form
  const rawData = {
    title: formData.get('title'),
    publicDescription: formData.get('publicDescription'),
    adminComment: formData.get('adminComment') || null,
    categoryId: formData.get('categoryId'),
    price: formData.get('price') ? parseFloat(formData.get('price') as string) : 0,
    district: formData.get('district'),
    address: formData.get('address'),
    rooms: formData.get('rooms') ? parseInt(formData.get('rooms') as string) : null,
    floor: formData.get('floor') ? parseInt(formData.get('floor') as string) : null,
    totalFloors: formData.get('totalFloors') ? parseInt(formData.get('totalFloors') as string) : null,
    houseArea: formData.get('houseArea') ? parseFloat(formData.get('houseArea') as string) : null,
    landArea: formData.get('landArea') ? parseFloat(formData.get('landArea') as string) : null,
    condition: formData.get('condition') || null,
    yearBuilt: formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt') as string) : null,
    noEncumbrances: formData.get('noEncumbrances') === 'true',
    noKids: formData.get('noKids') === 'true',
    userId: formData.get('userId') as string,
    status: formData.get('status') as string || 'active',
  };
  
  // Validate with Zod schema and return the validated data
  return listingSchema.parse(rawData);
} 