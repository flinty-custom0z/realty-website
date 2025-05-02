import { z } from 'zod';
import { ListingData } from '../services/ListingService';
import { prisma } from '@/lib/prisma';

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
  kitchenArea: z.number().nonnegative().nullable().optional(),
  landArea: z.number().nonnegative().nullable().optional(),
  condition: z.string().optional().nullable(),
  yearBuilt: z.number().int().positive().nullable().optional(),
  buildingType: z.enum(["BRICK", "PANEL", "MONOLITH", "OTHER"]).nullable().optional(),
  balconyType: z.enum(["BALCONY", "LOGGIA", "BOTH", "NONE"]).nullable().optional(),
  bathroomType: z.enum(["COMBINED", "SEPARATE", "MULTIPLE"]).nullable().optional(),
  windowsView: z.enum(["COURTYARD", "STREET", "BOTH"]).nullable().optional(),
  noEncumbrances: z.boolean().default(false),
  noShares: z.boolean().default(false),
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["active", "sold", "pending", "inactive"]).default("active"),
  dealType: z.enum(["SALE", "RENT"]).default("SALE"),
}).refine(async (data) => {
  // If deal type is RENT, validate that category is either apartments or commercial
  if (data.dealType === "RENT") {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { slug: true }
    });
    
    // Only allow apartments and commercial for rent
    return category && ['apartments', 'commercial'].includes(category.slug);
  }
  return true;
}, {
  message: "For rental listings, category must be either apartments or commercial",
  path: ["categoryId"]
});

export type ValidatedListingData = z.infer<typeof listingSchema>;

/**
 * Safely parses and validates form data for a listing using Zod
 * Throws a ZodError if validation fails
 */
export function parseListingFormData(formData: FormData): Promise<ListingData> {
  // Fields to exclude from validation (image-related fields)
  const excludedFields = ['newImages', 'imagesToDelete', 'featuredImageId'];
  
  // Extract listing data from form
  const rawData = {
    title: formData.get('title')?.toString() || "",
    publicDescription: formData.get('publicDescription')?.toString() || "",
    adminComment: formData.get('adminComment')?.toString() || null,
    categoryId: formData.get('categoryId')?.toString() || "",
    price: formData.get('price') ? parseFloat(formData.get('price') as string) : 0,
    district: formData.get('district')?.toString() || "",
    address: formData.get('address')?.toString() || "",
    rooms: parseNumberOrNull(formData.get('rooms')?.toString()),
    floor: parseNumberOrNull(formData.get('floor')?.toString()),
    totalFloors: parseNumberOrNull(formData.get('totalFloors')?.toString()),
    houseArea: parseFloatOrNull(formData.get('houseArea')?.toString()),
    kitchenArea: parseFloatOrNull(formData.get('kitchenArea')?.toString()),
    landArea: parseFloatOrNull(formData.get('landArea')?.toString()),
    condition: formData.get('condition')?.toString() || null,
    yearBuilt: parseNumberOrNull(formData.get('yearBuilt')?.toString()),
    buildingType: validateEnumOrNull(formData.get('buildingType')?.toString(), ["BRICK", "PANEL", "MONOLITH", "OTHER"]),
    balconyType: validateEnumOrNull(formData.get('balconyType')?.toString(), ["BALCONY", "LOGGIA", "BOTH", "NONE"]),
    bathroomType: validateEnumOrNull(formData.get('bathroomType')?.toString(), ["COMBINED", "SEPARATE", "MULTIPLE"]),
    windowsView: validateEnumOrNull(formData.get('windowsView')?.toString(), ["COURTYARD", "STREET", "BOTH"]),
    noEncumbrances: formData.get('noEncumbrances') === 'true',
    noShares: formData.get('noShares') === 'true',
    userId: formData.get('userId')?.toString() || "",
    status: formData.get('status')?.toString() || 'active',
    dealType: (formData.get('dealType')?.toString() as 'SALE' | 'RENT') || 'SALE',
  };
  
  // Helper functions for parsing numbers
  function parseNumberOrNull(value: string | undefined): number | null {
    if (!value || value.trim() === '') return null;
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  }
  
  function parseFloatOrNull(value: string | undefined): number | null {
    if (!value || value.trim() === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }
  
  function validateEnumOrNull<T extends string>(value: string | undefined, allowedValues: T[]): T | null {
    if (!value || value.trim() === '') return null;
    return allowedValues.includes(value as T) ? value as T : null;
  }
  
  // Validate with Zod schema and return the validated data
  return listingSchema.parseAsync(rawData);
} 