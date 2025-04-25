import { ListingData } from '../services/ListingService';

/**
 * Parses and validates form data for a listing
 */
export function parseListingFormData(formData: FormData): ListingData {
  // Extract listing data
  const title = formData.get('title') as string;
  const publicDescription = formData.get('publicDescription') as string;
  const adminComment = formData.get('adminComment') as string;
  const categoryId = formData.get('categoryId') as string;
  const price = parseFloat(formData.get('price') as string);
  const district = formData.get('district') as string;
  const address = formData.get('address') as string;
  const userId = formData.get('userId') as string;
  const status = formData.get('status') as string || 'active';
  
  // Parse numeric values with fallbacks
  const rooms = formData.get('rooms') ? parseInt(formData.get('rooms') as string) : null;
  const floor = formData.get('floor') ? parseInt(formData.get('floor') as string) : null;
  const totalFloors = formData.get('totalFloors') ? parseInt(formData.get('totalFloors') as string) : null;
  const houseArea = formData.get('houseArea') ? parseFloat(formData.get('houseArea') as string) : null;
  const landArea = formData.get('landArea') ? parseFloat(formData.get('landArea') as string) : null;
  
  const condition = formData.get('condition') as string;
  const yearBuilt = formData.get('yearBuilt') ? parseInt(formData.get('yearBuilt') as string) : null;
  const noEncumbrances = formData.get('noEncumbrances') === 'true';
  const noKids = formData.get('noKids') === 'true';
  
  // Create listing data object
  return {
    title,
    publicDescription,
    adminComment,
    categoryId,
    price,
    district,
    address,
    rooms,
    floor,
    totalFloors,
    houseArea,
    landArea,
    condition,
    yearBuilt,
    noEncumbrances,
    noKids,
    userId,
    status,
  };
} 