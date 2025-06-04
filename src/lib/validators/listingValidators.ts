import { z } from 'zod';
import { ListingData } from '../services/ListingService';
import { prisma } from '@/lib/prisma';

/**
 * Zod schema for validating listing data
 */
export const listingSchema = z.object({
  typeId: z.string().min(1, "Property type is required"),
  publicDescription: z.string().min(1, "Description is required"),
  adminComment: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  districtId: z.string().optional().nullable(),
  address: z.string().min(1, "Address is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  fullAddress: z.string().optional().nullable(),
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
  // Check if the category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if district exists
  if (data.districtId) {
    const district = await prisma.district.findUnique({
      where: { id: data.districtId },
    });
    
    if (!district) {
      throw new Error('District not found');
    }
  }
  
  // Check if property type exists and belongs to the selected category
  const propertyType = await prisma.propertyType.findUnique({
    where: { id: data.typeId },
  });
  
  if (!propertyType) {
    throw new Error('Property type not found');
  }
  
  if (propertyType.categoryId !== data.categoryId) {
    throw new Error('Property type does not belong to the selected category');
  }
  
  return true;
}, {
  message: 'Validation failed',
});

export type ValidatedListingData = z.infer<typeof listingSchema>;

/**
 * Safely parses and validates form data for a listing using Zod
 * Throws a ZodError if validation fails
 */
export async function parseListingFormData(formData: FormData): Promise<ListingData> {
  // Extract data from form
  const data: Record<string, string | number | boolean> = {};
  
  // Text fields
  const textFields = [
    'typeId', 'publicDescription', 'adminComment', 'categoryId', 
    'districtId', 'address', 'condition', 'userId', 'status', 'fullAddress'
  ];
  
  textFields.forEach(field => {
    const value = formData.get(field);
    if (value) data[field] = String(value);
  });
  
  // Number fields
  const numberFields = [
    'price', 'floor', 'totalFloors', 
    'houseArea', 'kitchenArea', 'landArea', 'yearBuilt',
    'latitude', 'longitude'
  ];
  
  numberFields.forEach(field => {
    const value = formData.get(field);
    if (value !== null && value !== '') {
      const num = Number(value);
      if (!isNaN(num)) data[field] = num;
    }
  });
  
  // Boolean fields
  const booleanFields = ['noEncumbrances', 'noShares'];
  
  booleanFields.forEach(field => {
    const value = formData.get(field);
    data[field] = value === 'true';
  });
  
  // Enum fields
  const enumFields = ['buildingType', 'balconyType', 'bathroomType', 'windowsView', 'dealType'];
  
  enumFields.forEach(field => {
    const value = formData.get(field);
    if (value) data[field] = String(value);
  });
  
  // Validate data with schema
  const validData = await listingSchema.parseAsync(data);
  
  return validData;
} 