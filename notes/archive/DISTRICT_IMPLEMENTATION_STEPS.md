# Implementation of District Selection and Creation Feature

## Database Changes

1. Add a District model to the Prisma schema:
```prisma
model District {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  listings    Listing[]
}
```

2. Update the Listing model to reference the District model:
```prisma
model Listing {
  // ... existing fields
  district        String?   // Keep this field temporarily for backward compatibility
  districtId      String?
  districtRef     District? @relation(fields: [districtId], references: [id])
  // ... other fields
}
```

3. Create a migration for these changes:
```bash
npx prisma migrate dev --name add_district_model
```

## API Implementation

1. Update the districts API endpoint to work with the District model:
```typescript
// src/app/api/districts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/validators/errorHandler';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    
    // Fetch all districts from the District model
    let districts = await prisma.district.findMany({
      orderBy: { name: 'asc' },
    });
    
    // If category filter is provided, filter districts that have listings in that category
    if (categorySlug) {
      const category = await prisma.category.findUnique({ 
        where: { slug: categorySlug } 
      });
      
      if (category) {
        // Find districts that have listings in this category
        const listingsWithDistricts = await prisma.listing.findMany({
          where: { 
            categoryId: category.id,
            status: 'active',
            districtId: { not: null }
          },
          select: { districtId: true },
          distinct: ['districtId']
        });
        
        const districtIds = listingsWithDistricts.map(l => l.districtId).filter(Boolean) as string[];
        
        // Only keep districts that have listings in this category
        if (districtIds.length > 0) {
          districts = districts.filter(d => districtIds.includes(d.id));
        }
      }
    }
    
    return NextResponse.json(districts);
  } catch (error) {
    return handleApiError(error);
  }
}

// Schema for district creation
const districtSchema = z.object({
  name: z.string().min(1, "District name is required"),
});

// Handle district creation (protected by auth)
async function handleCreateDistrict(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const validation = districtSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { name } = validation.data;
    
    // Create slug from name
    const slug = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    // Check if district with this name already exists
    const existing = await prisma.district.findFirst({
      where: { 
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug: slug }
        ]
      }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'District already exists', district: existing },
        { status: 409 }
      );
    }
    
    // Create new district
    const district = await prisma.district.create({
      data: {
        name,
        slug,
      }
    });
    
    return NextResponse.json(district, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Export POST method with auth protection
export const POST = withAuth(handleCreateDistrict);
```

2. Update the Listing validator to use districtId:
```typescript
// src/lib/validators/listingValidators.ts
export const listingSchema = z.object({
  // ... other fields
  districtId: z.string().min(1, "District is required"),
  // ... other fields
}).refine(async (data) => {
  // ... other validations
  
  // Check if district exists
  if (data.districtId) {
    const district = await prisma.district.findUnique({
      where: { id: data.districtId },
    });
    
    if (!district) {
      throw new Error('District not found');
    }
  }
  
  return true;
}, {
  message: 'Validation failed',
});

export async function parseListingFormData(formData: FormData): Promise<ListingData> {
  // ... existing code
  
  // Text fields
  const textFields = [
    'title', 'publicDescription', 'adminComment', 'categoryId', 
    'districtId', 'address', 'condition', 'userId', 'status'
  ];
  
  // ... rest of the code
}
```

3. Update the ListingData interface:
```typescript
// src/lib/services/ListingService.ts
export interface ListingData {
  // ... other fields
  districtId?: string | null;
  // ... other fields
}
```

## UI Implementation

1. Update the listings form to use a select for districts with an option to add new ones:
```tsx
// src/app/admin/listings/new/page.tsx
<div>
  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
    Район
  </label>
  {!showNewDistrictInput ? (
    <select
      id="districtId"
      name="districtId"
      value={formData.districtId}
      onChange={handleChange}
      className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
    >
      <option value="">Выберите район</option>
      {districts.map(district => (
        <option key={district.id} value={district.id}>
          {district.name}
        </option>
      ))}
      <option value="new">+ Добавить новый район</option>
    </select>
  ) : (
    <div className="space-y-2">
      <input
        type="text"
        value={newDistrict}
        onChange={(e) => setNewDistrict(e.target.value)}
        placeholder="Введите название района"
        className="w-full p-2 border rounded-md focus:border-[#11535F] focus:ring focus:ring-[rgba(17,83,95,0.2)] transition-all duration-200"
        disabled={isCreatingDistrict}
      />
      {districtError && (
        <p className="text-sm text-red-600">{districtError}</p>
      )}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleCreateDistrict}
          className="px-3 py-1 bg-[#11535F] text-white rounded-md text-sm flex items-center"
          disabled={isCreatingDistrict}
        >
          {isCreatingDistrict ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Создание...
            </>
          ) : (
            'Добавить район'
          )}
        </button>
        <button
          type="button"
          onClick={cancelNewDistrict}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          disabled={isCreatingDistrict}
        >
          Отмена
        </button>
      </div>
    </div>
  )}
</div>
```

2. Add state and handlers for districts:
```tsx
// src/app/admin/listings/new/page.tsx
const [districts, setDistricts] = useState<{ id: string; name: string; slug: string }[]>([]);
const [showNewDistrictInput, setShowNewDistrictInput] = useState(false);
const [newDistrict, setNewDistrict] = useState('');
const [isCreatingDistrict, setIsCreatingDistrict] = useState(false);
const [districtError, setDistrictError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      // ... existing code
      
      // Fetch districts
      const districtsRes = await fetch('/api/districts');
      if (!districtsRes.ok) {
        throw new Error('Failed to fetch districts');
      }
      const districtsData = await districtsRes.json();
      setDistricts(districtsData);
      
      // ... existing code
    } catch (error) {
      // ... existing error handling
    }
  };
  
  fetchData();
}, []);

const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target as HTMLInputElement;
  
  // Handle special case for district selection
  if (name === 'districtId' && value === 'new') {
    setShowNewDistrictInput(true);
    return;
  }
  
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
  }));
};

const handleCreateDistrict = async () => {
  if (!newDistrict.trim()) {
    setDistrictError('Название района не может быть пустым');
    return;
  }
  
  setIsCreatingDistrict(true);
  setDistrictError('');
  
  try {
    const response = await fetch('/api/districts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newDistrict.trim() }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 409) {
        // District already exists, use the existing one
        setDistricts(prev => 
          prev.find(d => d.id === data.district.id) 
            ? prev 
            : [...prev, data.district]
        );
        setFormData(prev => ({ ...prev, districtId: data.district.id }));
        setShowNewDistrictInput(false);
        setNewDistrict('');
      } else {
        throw new Error(data.error || 'Failed to create district');
      }
    } else {
      // District created successfully
      setDistricts(prev => [...prev, data]);
      setFormData(prev => ({ ...prev, districtId: data.id }));
      setShowNewDistrictInput(false);
      setNewDistrict('');
    }
  } catch (error) {
    setDistrictError(error instanceof Error ? error.message : 'Ошибка при создании района');
  } finally {
    setIsCreatingDistrict(false);
  }
};

const cancelNewDistrict = () => {
  setShowNewDistrictInput(false);
  setNewDistrict('');
  setDistrictError('');
};
```

## Data Migration Script

Create a script to migrate existing district data:

```typescript
// scripts/populate-districts.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to populate districts from listings...');

  try {
    // Get all unique districts from listings
    const districts = await prisma.listing.groupBy({
      by: ['district'],
      where: {
        district: {
          not: null,
        },
      },
    });

    // Filter out empty districts
    const validDistricts = districts
      .map(d => d.district)
      .filter(Boolean) as string[];

    console.log(`Found ${validDistricts.length} unique districts`);

    // Process each district
    for (const districtName of validDistricts) {
      // Create slug from name
      const slug = districtName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      // Check if district with this name already exists
      const existing = await prisma.district.findFirst({
        where: {
          OR: [
            { name: { equals: districtName, mode: 'insensitive' } },
            { slug: slug }
          ],
        },
      });

      if (existing) {
        console.log(`District already exists: ${districtName} (${existing.id})`);
        
        // Update listings to reference this district
        const updatedCount = await prisma.listing.updateMany({
          where: {
            district: districtName,
            districtId: null,
          },
          data: {
            districtId: existing.id,
          },
        });
        
        console.log(`Updated ${updatedCount.count} listings to reference district: ${districtName}`);
        continue;
      }

      // Create new district
      const newDistrict = await prisma.district.create({
        data: {
          name: districtName,
          slug,
        },
      });

      console.log(`Created new district: ${districtName} (${newDistrict.id})`);

      // Update listings to reference this district
      const updatedCount = await prisma.listing.updateMany({
        where: {
          district: districtName,
          districtId: null,
        },
        data: {
          districtId: newDistrict.id,
        },
      });

      console.log(`Updated ${updatedCount.count} listings to reference district: ${districtName}`);
    }

    console.log('District population completed successfully');
  } catch (error) {
    console.error('Error during district population:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Script completed successfully'))
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  });
```

Run this script after applying the database migrations:

```bash
npx ts-node scripts/populate-districts.ts
```

## Future Enhancements

1. Update search and filtering functionality to use the District model relationships
2. Add district management in the admin panel
3. Remove the old district field from the Listing model once all data has been migrated
4. Add validation to prevent duplicate district names 